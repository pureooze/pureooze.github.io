---
title: "The Comprehensive Guide To AppArmor: Part 1"
thumbnail: 2016-07-28-the-comprehensive-guide-to-apparmor-p1/thumbnail.jpg #TODO: make it dynamic type
small-thumbnail: 2016-07-28-the-comprehensive-guide-to-apparmor-p1/small-thumbnail.jpg #TODO: make it dynamic type
tags: 
  - apparmor
  - security
  - linux
---


I wanted to do this post on the basics of AppArmor and how to get started with using it on your system. 
This post started as a very small guide on AppArmor but as I wrote it I felt more and more convinced it needed details to explain various features and issues.
As such it has now ended up as a comprehensive guide on how to start using and understanding the AppArmor tools.

<!-- excerpt -->

**This post was originally posted on July 28th 2016. Things may have changed since then, and this post may no longer be accurate. Proceed with caution.**

In case you don't know what AppArmor is, the official wiki provides a decent explanation:
> AppArmor is an mandatory access control (MAC) like security system for Linux. 
> It is designed to work with standard Unix discretionary access control (DAC) permissions while being easy to use and deploy, by allowing an admin to confine only specific applications.

Essentially AppArmor provides MAC functionality to Linux and is used to supplement the traditional DAC (file permissions) functionality that the OS provides. 
Using the most basic AppArmor tools an administrator can create and deploy AppArmor profiles to restrict access for specific processes. 
For example one could restrict the web browser to only let users access files in their home directories. 
This would prevent a scenario where Alice would try to upload or share files owned by Bob without his knowledge.

## Getting Started
To run AppArmor the first step is the same as all other software, make sure that it is installed. 
OpenSUSE and Ubuntu have it installed and enabled by default but other distros may vary. 
Installing AppArmor is usually as simple as checking if a distro has a package for it, then downloading and installing the package. 
Note that the kernel must be compiled with support for AppArmor.
Once AppArmor is running you can make sure the service is running using:

```bash
systemctl status apparmor  # Checks status of the AppArmor service and tells you if it is enabled on boot
systemctl start apparmor  # Starts the service
systemctl enable apparmor  # Makes apparmor start on boot
```

This will ensure that the system is always up and running with AppArmor ready to enforce profiles.

### Using aa-status
Now that the service is running let's start using the AppArmor tools (`aa-tools`) to monitor and manage the system. 
To start we can use the `aa-status` tool to check what profiles are loaded and what status they currently have. 
On a fresh Ubuntu system I had something like this:

```bash
user@ae:~$ sudo aa-status  
[sudo] password for user:  
apparmor module is loaded. 
12 profiles are loaded. 
12 profiles are in enforce mode. 
   /sbin/dhclient 
   /usr/bin/lxc-start 
   /usr/bin/ubuntu-core-launcher 
   /usr/lib/NetworkManager/nm-dhcp-client.action 
   /usr/lib/NetworkManager/nm-dhcp-helper 
   /usr/lib/connman/scripts/dhclient-script 
   /usr/lib/lxd/lxd-bridge-proxy 
   /usr/sbin/tcpdump 
   lxc-container-default 
   lxc-container-default-cgns 
   lxc-container-default-with-mounting 
   lxc-container-default-with-nesting 
0 profiles are in complain mode. 
1 processes have profiles defined. 
1 processes are in enforce mode. 
   /sbin/dhclient (2092)  
0 processes are in complain mode. 
0 processes are unconfined but have a profile defined.
```

So right away we can see that 12 profiles have been loaded by the system and are in an enforce status. 
What this means is that AppArmor will monitor the processes that match these profiles and decide if a specific action is permitted or denied by the policy. 
If this seems confusing so far, don't give up yet, once I show some examples on what profiles look like I think this will make more sense.

One other thing I wanted to point out about this output was the `complain` and `unconfined` status. 
When a profile is in complain mode AppArmor will allow it to perform (almost)[^complainmodestatus] all tasks without restriction, but it will log them in the audit log as events. 
This is useful when you are attempting to create a profile for an application but are not sure what things it needs access to. 
The unconfined status on the other hand will allow the program to perform any task and will not log it. 
This usually occurs if a profile was loaded after an application is started, meaning it runs without restrictions from AppArmor. 
It's also important to note that only processes that have profiles are listed under this unconfined status, any other processes that run on your computer but do not have a profile created for them will not be listed under `aa-status`.

### Using aa-genprof
Now that we covered what different states an AppArmor profile can be in we can move on to learning how to build these profiles for a specific program. 
For this demo we are going to create a simple script that we will then enforce with AppArmor. 
You will also need to create a directory called "data" in the same directory as the script before running it for this example to work. 
The goal is to demonstrate that we can use AppArmor to prevent the script from accessing any other paths.

So, create the directory "data" and then create a script called example.sh:
```bash
#!/bin/bash 
 
echo "This is an apparmor example." 
 
touch data/sample.txt 
echo "File created" 
 
rm data/sample.txt 
echo "File deleted"
```

Make sure to give it the execute permission and then run it:

```bash
user@ae:~$ ./example.sh  
This is an apparmor example. 
File created 
File deleted
```

Great our script worked! Now lets start enforcing it with AppArmor. 
There are two main tools we use to generate and add on to profiles, `aa-genprof` and `aa-logprof`. 
The first is used to monitor and create a profile for an application the first time it is run (i.e. when you are first creating the profile) so that AppArmor can learn what the applications tendencies are and prompt you for what behavior needs to be taken in certain circumstances. 
The second is useful once you have an existing profile and need to allow/deny access to certain tasks which have already been logged during enforce or complain modes.

Lets start `aa-genprof` on our script:
```bash
user@ae:~$ aa-genprof example.sh
[ ...long message about aa-genprof...]
 
Profiling: example.sh 
 
[(S)can system log for AppArmor events] / (F)inish
```

Leave this prompt as is, now run the example.sh script in a new terminal window. 
Note that `aa-genprof` requires us to run the program while it is monitoring the process so that it can scan the log to learn about all the events the program creates. 
It will then propose rules to add to the profile for us. 
Once you have run the script, press the 's' key in the genprof terminal window:

```bash
[(S)can system log for AppArmor events] / (F)inish 
Reading log entries from /var/log/audit/audit.log. 
Updating AppArmor profiles in /etc/apparmor.d. 
 
Profile:  /home/user/bin/example.sh 
Execute:  /usr/bin/touch 
Severity: 3 
 
(I)nherit / (C)hild / (N)amed / (X) ix On / (D)eny / Abo(r)t / (F)inish
```

Let's stop for a second here and get a grasp of what exactly we are looking at. 
This is what a prompt from the AppArmor tools looks like, it is telling you that a profile (usually denoted by the absolute path of the program) is attempting to access or execute a certain file OR that the process requires access to a certain capability from the kernel. 
If you are not familiar with capabilities don't worry about them for now. 

AppArmor also attempts to provide a severity warning based on what the process is trying to do (1 being low warning and 10 being very serious) but this is not always accurate as some programs legitimately need access to resources which count as a very severe warning. 
For example the Chrome(ium) browser requires access to `CAP_SYS_ADMIN `to create a secure sandbox for its child processes but AppArmor would give a severity 10 warning for this.

We should also note how AppArmor gives us several different options here on what we can do but let's focus on the core ones:
* **Inherit:** Creates a rule that is denoted by "ix" within the profile, causes the executed binary to inherit permissions from the parent profile.
* **Child:** Creates a rule that is denoted by "Cx" within the profile, requires a sub-profile to be created within the parent profile and rules must be separately generated for this child (prompts will appear when running scans on the parent).
* **Deny:** Creates a rule that AppArmor prepends with "deny" at the start of the line within the profile, causes the parents access to the resource be denied.
* **Abort:** Exits the AppArmor program without saving any changes.
* **Finish:** Exits the AppArmor program but WILL save changes.

This is really the tricky part with generating your own AppArmor profiles, you need to know what permissions the need to be given and denied. 
Due to this I highly recommend using preexisting profiles if it is at all possible, especially if they are peer-reviewed and distributed by a trusted party. 
For this script however we are fine with just giving /usr/bin/touch Inherit permissions. 
After that a similar prompt will come up for /usr/bin/rm and since we know the script also legitimately uses that, we will give Inherit access once again.

The next prompt seems a bit different than these previous two:
```bash
Complain-mode changes: 
 
Profile:  /home/user/bin/example.sh 
Path:     /dev/tty 
Mode:     rw 
Severity: 9 
 
  1 - #include <abstractions/consoles>  
  2 - #include <abstractions/libvirt-qemu>  
  3 - #include <abstractions/ubuntu-konsole>  
  4 - #include <abstractions/ubuntu-xterm>  
 [5 - /dev/tty] 
[(A)llow] / (D)eny / (I)gnore / (G)lob / Glob with (E)xtension / (N)ew / Abo(r)t / (F)inish / (M)ore
```

Notice how there is a new field called "Mode" that tells us what permissions the script is requiring when accessing the "Path".
Also note how there are some new options available, the core ones are:

* **Allow:** Allow access to the path with the requested permissions
* **Deny:** Deny access to the path with the requested permissions
* **Ignore:** Skip this prompt, it will appear again the next time you run logprof

Since this script is prints to the console it needs access to the TTY interface and so it can be allowed. 
Another prompt follows for /etc/ld.so.preload which according to the man page for ld.so is used for "list of ELF shared objects to be loaded before the program". 
This can be allowed as it is harmless. The next prompt shows something interesting, see if you can recognize its importance:

```bash
Profile:  /home/user/bin/example.sh 
Path:     /home/user/bin/data/sample.txt 
Mode:     rw 
Severity: unknown 
 
 [1 - /home/user/bin/data/sample.txt] 
[(A)llow] / (D)eny / (I)gnore / (G)lob / Glob with (E)xtension / (N)ew / Abo(r)t / (F)inish / (M)ore
```

This should look familiar as this is the file that is created by the script! 
AppArmor is notifying us that example.sh tries to create a file sample.txt in the directory /home/user/bin/data. 
Once again we know this is legitimate behavior for the script, and so we can allow it. 
Finally, we get a prompt asking if we wish to save changes or not. Press 's' to save changes and then 'f' to finish.

```bash
= Changed Local Profiles = 
 
The following local profiles were changed. Would you like to save them? 
 
 [1 - /home/user/bin/example.sh] 
(S)ave Changes / Save Selec(t)ed Profile / [(V)iew Changes] / View Changes b/w (C)lean profiles / Abo(r)t 
Writing updated profile for /home/user/bin/example.sh. 
 
Profiling: /home/user/bin/example.sh 
 
[(S)can system log for AppArmor events] / (F)inish 
 
Reloaded AppArmor profiles in enforce mode. 
 
Please consider contributing your new profile! 
See the following wiki page for more information: 
http://wiki.apparmor.net/index.php/Profiles 
 
Finished generating profile for /home/user/bin/example.sh.
```

Confirm the script still works by running it again, AppArmor should not have interfered with the script.

## Learning To Adapt
Up to this point we have seen how to use AppArmor to profile and enforce rules against a process. 
However, this was all done under the assumption that the example.sh script will never change. 
Unfortunately software in the real world does not work this way, it is often updated which causes it to require addition or removal of access for certain files and features. 
This means we need to be able to leverage AppArmor, so it allows us to update profiles as programs change. 
This is where `aa-logprof` and `aa-mergeprof` come in.

### aa-logprof
This tool is used to scan the audit log for any events that AppArmor could not match to existing rules in a profile and will then prompt you for changes. 
Before we start using it, make sure that the example.sh profile is being enforced by AppArmor. 
You can check this using `aa-status`:

```bash
apparmor module is loaded. 
??? profiles are loaded. 
??? profiles are in enforce mode.
/home/user/bin/example.sh  <--- You should see it under this heading
...
??? profiles are in complain mode.
...
??? processes have profiles defined. 
??? processes are in enforce mode.
...
??? processes are in complain mode. 
??? processes are unconfined but have a profile defined.
```

Now open up the script and edit it so that instead of using the data directory, the script attempts to read and write in its own directory:

```bash
#!/bin/bash  
  
echo "This is an apparmor example."  
  
touch sample.txt  
echo "File created"  
  
rm sample.txt  
echo "File deleted"
```

Then just run the script and you should see an error message similar to this:

```bash
This is an apparmor example. 
touch: cannot touch 'sample.txt': Permission denied 
File created 
rm: cannot remove 'sample.txt': No such file or directory 
File deleted
```

Success! As strange as it may seem, this is good news because AppArmor has blocked the script from making changes to the system since it no longer matches the rules described in the profile. 
To fix this we need to have the AppArmor profile updated, so start `aa-logprof` and follow the prompts to allow access to the new paths and save changes:

```bash
user@ae:~$ aa-logprof 
Reading log entries from /var/log/audit/audit.log. 
Updating AppArmor profiles in /etc/apparmor.d. 
Enforce-mode changes: 
 
Profile:  /home/user/bin/example.sh 
Path:     /home/user/bin/sample.txt 
Mode:     w 
Severity: unknown 
 
 [1 - /home/user/bin/sample.txt] 
(A)llow / [(D)eny] / (I)gnore / (G)lob / Glob with (E)xtension / (N)ew / Abo(r)t / (F)inish / (M)ore 
Adding /home/user/bin/sample.txt w to profile
= Changed Local Profiles = 
 
The following local profiles were changed. Would you like to save them? 
 
 [1 - /home/user/bin/example.sh] 
(S)ave Changes / Save Selec(t)ed Profile / [(V)iew Changes] / View Changes b/w (C)lean profiles / Abo(r)t 
Writing updated profile for /home/user/bin/example.sh.
```

Now if the script is run, it completes successfully just like before:

```bash
user@ae:~$ ./example.sh  
This is an apparmor example. 
File created 
File deleted
```

And just like that have updated our scripts profile!

### aa-mergeprof & AppArmor Profiles
In this section I am not going to cover the technical details of `aa-mergeprof` as it is not a key tool with day to day AppArmor usage. 
Instead, I will provide a scenario and then explain what different things we see inside an AppArmor profile. 
It is more important to understand the profiles than it is being familiar with the less common tools.

Suppose we are in a situation where we have two systems A and B, along with two users Alice and Bob. 
When Alice updates the script on computer A, she makes the appropriate changes to the AppArmor profile. 
Bob at the same time makes different changes to the script and also updates the profile as appropriate. 
At some later date Alice and Bob combine their versions of the script together and now want to use AppArmor to enforce a policy on it. 
However, since they made changes to the profile separately they cannot just copy one of the profiles alone, they need to merge them together. 
This may seem like a very difficult task, especially for very large scripts but fortunately `aa-mergeprof` is able to save us from having to do most of the work!

Now lets take a look at the actual profiles. All AppArmor profiles will be stored in the `/etc/apparmor.d` directory. 
If the example.sh is stored in `/home/user/bin/example.sh` then you will find its respective profile in `/etc/apparmor.d/home.user.bin.example.sh`. 
Open that up in a text editor and let's see what it says:

```bash
# Last Modified: Wed Jul 27 23:19:01 2016 
#include <tunables/global> 
 
/home/user/bin/example.sh { 
  #include <abstractions/base> 
  #include <abstractions/bash> 
 
  /bin/bash ix, 
  /dev/tty rw, 
  /etc/ld.so.preload r, 
  /home/user/bin/data/sample.txt rw, 
  /home/user/bin/example.sh r, 
  /home/user/bin/sample.txt w, 
  /usr/bin/rm rix, 
  /usr/bin/touch rix, 
 
}
```

Below is what a profile declaration looks like, this tells AppArmor the path to the program and that anything within the {} is designated for this process.

```bash
/home/user/bin/example.sh {
    ...
}
```

Then the following lines are used to pull in generic rules from some preconfigured libraries:

```bash
#include <abstractions/base> 
#include <abstractions/bash>
```

After that there are a bunch of lines that define a file as well as the permissions the profile will allow them to access. 
Don't worry too much about what they do individually and instead focus on the fact that they are single lines to describe access to a single resource.

Let's reverse the changes we made before and force the script to require the data directory only once more. 
Recall that to deny permission to a resource AppArmor will prepend the line with deny. 
You will need to change the current profile so that it will deny access to the `/home/user/bin/sample.txt` file AND delete the line for `/home/user/bin/data/sample.txt`. 
Once done it should look like this:

```bash
# Last Modified: Wed Jul 27 23:19:01 2016 
#include <tunables/global> 
 
/home/user/bin/example.sh { 
  #include <abstractions/base> 
  #include <abstractions/bash> 
 
  /bin/bash ix, 
  /dev/tty rw, 
  /etc/ld.so.preload r, 
  /home/user/bin/example.sh r, 
  deny /home/user/bin/sample.txt w, 
  /usr/bin/rm rix, 
  /usr/bin/touch rix, 
 
}
```

One thing I should point out is that whenever you make manual changes to an AppArmor profile you need to tell AppArmor to do a refresh or else your changes will not take effect. 
This can be done either through a command (ideal) or just by restarting the AppArmor service (not ideal).

```bash
apparmor_parser -r /etc/apparmor.d/home.user.bin.example.sh
```

If you try to run the script now you should get the same error we had before:

```bash
This is an apparmor example. 
touch: cannot touch 'sample.txt': Permission denied 
File created 
rm: cannot remove 'sample.txt': No such file or directory 
File deleted
```

Awesome! This is proof that the changes made to our policies not only have a legitimate impact on the access control of the system, but they can be changed on the fly as needed. 
There are more delicate details that we can explore about profiles but for an introduction this much is sufficient.

## Going To The Next Level
Up to this point you have done enough with AppArmor that you can use it on a day-to-day basis to manage profiles on a single system. 
However, in large or constantly changing environments the tools used so far are not enough, we need to be able to scale our monitoring and management of profiles as well as learn how to differentiate good policies from bad policies. 
For now, I want to leave you with an interesting thought about AppArmor and we will try and address it in the part 2 of this guide.

### An Interesting Idea
Recall the description of AppArmor from the official wiki:

> AppArmor is an mandatory access control (MAC) like security system for Linux. 
> It is designed to work with standard Unix discretionary access control (DAC) permissions while being easy to use and deploy, by allowing an admin to confine only specific applications.

Recall that DAC can be used to restrict access to files and directories through a set of permissions defined by the owner of the file (and to some extent the system defaults). 
The question we can ask is that if AppArmor is capable of restricting access to files and directories is it enough to just use it to completely replace our DAC system? 
Consider the following:

> Suppose Bob had created some confidential file that he did not want to share with Alice but placed it in a path that she had full access to. 
> Now imagine that he realized this and decided to use only AppArmor to prevent her and any other user from accessing it. 
> Could it be done? Can Bob guarantee that other users would never be able to have unauthorized access to the file?

## Additional Notes
[^complainmodestatus]complain mode status will still enforce any explicit deny rules in a profile
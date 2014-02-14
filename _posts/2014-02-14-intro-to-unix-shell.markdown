---
layout: post
title: Introduction to the Unix shell
---
## FAQ
### What's a shell?
A shell is a way to interact with your operating system via a text based system. 
This allows you to do useful things like fast searches and scripting. Since it is
a minimal interface, it makes it great to use across network connections.

### Shell vs. Terminal
People often ask what the difference between a shell and a terminal is. A shell is the actual
interface between you and your OS, the terminal is the (GUI) application that surrounds it.

Generally you can use either interchangably and people will know what you are talking about.

####Common Terminals:

- Mac: Terminal, iTerm2
- Linux/other Unix: xterm, gnome-terminal

### What if I am using Windows?
If you are using Windows, I would recommend using a VM or creating an iLab account. While
Windows does have cmd and PowerShell, Windows is a very different operating system with 
very different utilities. We will be focusing on commands found commonly on Unix systems.

### How do I create an iLab account
https://www.cs.rutgers.edu/resources/systems/ilab/newaccount/create/

Problems? Email help@cs.rutgers.edu

### How do I access iLab machines remotely via Windows or a Chromebook?
I recommend connecting with an SSH application such as SecureShell (Google Chrome plugin) 
or Putty.

### What's the difference between a command and a program?
You will probably see me using these terms interchangably. The explicit is that you enter a 
command in the shell that tells your OS what program to run and how to run it.

## Running commands
Simply open up a shell, type a command, and hit enter. It is that simple. For example:
`echo "Hello World!"`.

If you get an error saying something along the lines of "command not found", then this
usually means:

1. The command is not installed on the machine you are using
2. Your environment is misconfigured. (more on this later)

### Flags
Also called options, are ways of modifying the behavior of commands. They usually are after
the program name, starting with `-` or `--`. You can mix and match flags to get the behavior
that you want. What each flag does is completely dependent on the command.

Flags starting with `-` can usually be combined into a single `-` flag. For example:
`ls -R -a -l` = `ls -Ral`. This is NOT true for `--` flags.

### Arguments
Arguments are user defined information that is passed to commands an flags. They immediately 
follow the command/flag. For example, in `ls /usr/local`, `/usr/local` is the argument.
Depending on the command, you can give 0 to many arguments.

## Getting help
Memorizing all of this flags and how to use each command will come in time. You will
not know them all.

For most commands, there is usually a man (manual) page associated with it. 
To read the man page of a command, simply use `man command`. This will give you 
more information on how to run a program.

## Paths
Paths are the "addresses" of files and folders. There are 2 types of paths: 
absolute and relative. Both can be used in conjunction with any command that takes in 
a file or folder as an argument.

###Absolute Paths
Absolute paths are paths that start from /, the root folder. For example:

- /home/wlynch/
- /usr/local/bin/python
- /var/log/messages/

### Relative Paths
Relative paths are paths that start relative to your current position. For
example:

- `~` : Your home directory
- `~user` : user's home directory
- `.` : Your current directory
- `..` : The parent of your current directory

## Basic Navigation
- `pwd` : print working directory
- `ls` : list
	
	Common options:
	- `-a` : Show all files (even hidden)
	- `-l` : List in long format
	- `-h` : Use human readable sizes (useful with -l)
	- `-R` : Recursively list.
	- `-d` : List the directory, not its contents
- `cd` : change directory
	
	Special uses:
	- `cd` : go to home directory
	- `cd -` : go to the last directory

## Reading files
- `cat file` : Print out file
- `less file` : Print out file, with scrolling

	Tip:
	Use `/` to search a file in less. Use `n` to go to the next search term in the file
	and `N` for the previous.

## Editing files
- `vim`
- `emacs`

I am particular to vim, so we will briefly go over the basics.

### Vim (Vi IMproved) Basics
- In vim, there are 3 modes in vim: Command, Insert, and Visual.
- When you start vim, you begin in command mode. 
- To move to insert mode, hit `i`. 
- To exit insert mode, hit `ESC`.
- To save, enter `:w` in command mode
- To exit, enter `:q` in command mode

## Permissions
To view permissions of a file or directory, use `ls -l`. You should see something like:

	total 5972
	drwxr-xr-x  2 wlynch92 allusers   4096 Nov 15 14:22 bin
	drwxr-xr-x  3 wlynch92 allusers   4096 Sep  4 14:30 build
	drwx------ 17 wlynch92 allusers   4096 Feb 16  2013 class
	drwxr-xr-x  6 wlynch92 allusers   4096 Dec 11 12:35 Desktop
	drwxr-xr-x  2 wlynch92 allusers   4096 Nov 13  2012 Documents
	drwxr-xr-x  2 wlynch92 allusers   4096 Dec 12 11:03 Downloads
	drwxr-x--- 12 wlynch92 studsys    4096 Jan  8 15:44 lcsr
	drwxr-xr-x  2 wlynch92 allusers   4096 Apr 13  2012 lib
	drwxr-xr-x  8 wlynch92 allusers   4096 Oct 25 15:33 minecraft
	-rwxr-xr-x  1 wlynch92 allusers 280212 Oct 25 15:33 Minecraft.jar
	-rw-------  1 wlynch92 allusers    141 Sep 26 20:28 payroll.yaml
	drwxr-xr-x  3 wlynch92 allusers   4096 Nov 27 15:44 public_html
	-rw-r--r--  1 wlynch92 allusers  30141 Sep 28  2012 resume.pdf
	drwxr-xr-x  3 wlynch92 allusers   4096 Feb  3  2012 share
	drwxr-xr-x 10 wlynch92 allusers   4096 Oct  2 10:36 src
	drwxr-xr-x  2 wlynch92 allusers   4096 Feb 11 10:07 tmp
	drwxr-xr-x  2 wlynch92 allusers   4096 Jun  8  2012 Videos

Each column has a particular meaning:

1. Permissions
2. # of hard links
3. Owning User
4. Owning Group
5. Size
6. Last Modified Date
7. Name

Permissions are broken up into 9 fields.

The first character represents the file type. This can be:
- `-` : File
- `d` : Directory
- `l` : symlink
- Other file types that we will note worry about for now.

The next 9 characters should be viewed as 3 different sets of `rwx`. The first set
represents the permissions of the owning user. The second set represents the permissions
of the owning group. The third set represents the permissions of anyone else. 

`r`, `w`, and `x` take on different meanings depending on the type of file.
For files:
- `r` : The user can read the file.
- `w` : The user can write to or remove the file.
- `x` : The user can execute the file as a program.

For directories:
- `r` : The user can see what is inside the directory.
- `w` : The user can add/remove files to the directory.
- `x` : The user can `cd` into the directory.

A `-` means that the corresponding group does not have that permission.

There are additional permissions that you can set for finer control, but we will not be
covering those here. Check out the man page for more details!

### Setting permissions
You can set permissions of a file via the `chmod` command. There are 2 modes of chmod:
absolute or symbolic.

#### Absolute permissions
Absolute permissions are represented by 3 digit octal numbers representing each of the 3
groups of permissions. Imagine that you represent each permission as a binary number where
r = 4, w = 2, and x = 1. You can represent each group as the sum of these numbers. For example:

- rwx = 7
- r-x = 5
- r-- = 4
- --- = 0

You can then combine this for all 3 groups to form an absolute permission: `chmod 755 example.txt`

#### Relative permissions
Relative permissions change permissions relative to it's current state. This is useful to
ensure that multiple files have a certain permission property regardless of their original
state. This is done by using:

- a group : `u` (user), `g` (group), or `o` (other)
- an operation : `+`, `-`, `=`
- a permission : `r`, `w`, `x`

For example:
`chmod ug+r example.txt` will add the read permission for the user and group 
(if it didn't already exist).

## File/directory manipulation
- `touch` : Create a file / update time of access
- `mkdir` : Make a directory

	Common options:
	- `-p` : Create the folder and all necessary parents that don't exist.
- `rmdir` : Remove a directory

	Note: the directory must be empty.
- `mv` : Move a file/directory

	The `mv` command is also used to rename a file. For example: `mv a b` will rename file
	a to b.
- `rm` : Remove a file/directory
	
	Common options:
	- `-f` : Do not prompt user for deletion.
	- `-r` : Recursively remove a directory

		Be careful when using this with the -f flag!

- `cp` : Copy a file/directory
	Common options:
	- `-p` : Preserve permissions
	- `-R` : copy recursively
	- `-a` : Same as `-pR`

- `ln` : Make a link

	Links are a way to create shortcuts to files. This is useful so that a file can be in multiple
	locations on your filesystem without taking up additional space. There are 2 types of links: 
	Hard and Soft. 
	
	Hard links point to a file's contents directly. If the original is deleted you will still be
	able to access it through the link.

	Soft links point to a files contents indirectly. Instead, it points to the original location
	of the file. You can think of this as a traditional shortcut. Soft links are also called
	symbolic links or "symlinks". You can create a symlink with the `-s` flag.

## Other useful commands
### Disk usage
- `du` : (disk usage stats) Show sizes of files
- `df` : (disk free stats) Show drive disk usage.
- `quota` : See disk quota usage

### File search
- `find` : recursively list files
- `diff` : compare files for differences
- `grep` : (Global Regular Expression Parser) Search file via a regular expression
- `which` : See which program your shell is executing
- `whereis` : See where your shell can find a program

### User info
- `finger` : get user info
- `whoami` : Display current user
- `ypcat` : Get NIS user information
- `w` : See who is logged in

### Processes
- `ps` : Show process information
- `top` : Show updating process information
- `kill` : Send signal to process by PID
- `pkill` : Send signal to process by name

### Network
- `ping` : Send echo packet
- `wget` : Get HTTP page
- `curl` : Send network request
- `host/dig` : DNS lookup
- `ifconfig` : See/change network information for your machine.
- `hostname` : Get/set the hostname of your current machine
- `ftp/sftp` : Get/put file from/to remote server via FTP.
- `ssh` : Connect to remote host via SSH.
- `pdsh` : ssh on steroids. See http://vverma.net/use-pdsh-to-shell-into-multiple-hosts.html

### File compression
- `tar`
- `zip/unzip`
- `bzip2`

### Misc
- `echo` : Print to stdout
- `sleep` : Do nothing for x seconds
- `alias` : Remap one command to another

## Redirection
You can manipulate stdin (input) as well as stdout and stderr (output) to your commands via 
stream redirection. You can do this by appending these to the end of your command:

- ``\<`` : Redirect stdin to read in from thing on right
- ``\>`` : Write stdout to file (overwrites existing contents)
- ``\>\>`` : Append stdout to file
- ``2>` / `2>>`` : Same as `>`/`>>`, but with stderr
- ``&>` / `&>>`` : Same as `>`/`>>`, but with both stdout and stderr 
- ``|`` : Use the output of the left as the input of the right

	Example: `ls | grep asdf` 

### Command substitution
You can nest commands within each other by nesting them within \`\`. For example:
`ifconfig > `hostname`.txt`

## Environment variables
Something I hear a lot is "How does the shell know what to run?" The answer to this question
is environment variables.

Environment variables are settings that your shell configures when you log in. You
can view all of these variables with the `env` command. The `PATH` variable tells your
shell in what folders it should look for programs when you enter a command (and in what order
it should look at them). You can view your path by running `echo $PATH` (`$` signifies 
a shell variable).

You can modify your path by running `export PATH=$PATH:new_directory`. This make it very
easy to add other directories where you can put your own code or add programs that
were installed in non-standard paths. I recommend you add `~/bin` to your path so that
you can start adding your own programs to your path.

WARNING: Only add trusted folders to your path. Otherwise someone could make a bad program 
with a common name that you could accidentally run without even knowing!

## Shell configuration

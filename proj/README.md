=========
Minecraft Reactive
=========

![alt tag](https://raw.githubusercontent.com/montoias/aasma/master/minecraft.png?token=1915774__eyJzY29wZSI6IlJhd0Jsb2I6bW9udG9pYXMvYWFzbWEvbWFzdGVyL21pbmVjcmFmdC5wbmciLCJleHBpcmVzIjoxMzk5MjU0OTQ2fQ%3D%3D--6bee8a2715ea6d2f5c2ea9e2434a5ea0e5a85fd0)

====================
Kind of bots created:
====================

	- Lumberjacker
		- Random movement (each 10 times)
	- Hunter
	- Guards
	- Forward movement

============
Lumberjacker
============

Sensores 
========

  spawn
    
    this sensor acts upon the spawn of the entity

  entityMoved
    
    this sensor acts upon some movement from the entity

  isDigging
  
    this sensor checks if the entity is actually digging 

  materialNeighbor

      this sensor checks if in the neighbor there are material (wood, in this case) that the entity is looking for 

  canDigBlock
      
      this sensor checks the block that the entity wants to dig it is diggable

  isStorage 
      
      this sensor checks if the blocks around the bot belongs to the storage

  hasItemsInInventory
  
    this sensor lists items from bot’s inventory if isn’t empty

  freeNeighbors
    
    this sensor lists free blocks around the bot so that he can move for.

  isYawValid (degree, pos)
  
    this sensor checks if the position in front of bot is empty

  entityHurt
  
    this sensor acts when something/someone hurts the bot

  isBadlyInjured (health <= 5) 

  isEnemyNear (nearestEntity) 
	
  isEmptyBlock
    
    is the block in front of the bot empty (filled with ‘air’)

  isBlockingElement 
  
    is the block in front of the bot:	
      - 'vine'
      - 'Water'
      - 'Lava'
	    - 'Stationary Lava'
      - 'tallgrass'

  onDiggingCompleted
    
    when the digging is completed

  onDiggingAborted
  
    when the digging is aborted 
    
    
    
==========
Actuadores:
==========
- dig
- chat
- lookAt
- attack
-  setControlState
	- Left, Right, Front, Back
	- Run
	- Jump
- clearControlStates (reset states)
- tossStack
    
=======
Hunter:
=======

To be described
    
===========
City Guards
===========

Each guard launches a process every 1 second to check if there is any Entity trying to pass through them.

========
Sensores
========

Spawn
	
	this sensor acts upon the spawn of the entity

Health

	this sensor acts upon health decrease and increase. Will be used further with deliberative process.

nearestEntity
	
	this sensor will return the nearest entity in a 5 range radius.

itemByName
 	
 	this sensor will check if a guard has a specific item.

==========
Actuadores
==========
- lookAt :: Position
- attack  :: Entity
- equip :: Item, bodyPosition 
- chat :: String
- spawnPoint :: Position
- yaw :: Degree

==============
Storage Guards
==============

They are equal with the city guards for now, but will change in the deliberative process.


=====
Setup
=====

Node
-----
  Npm will install a bad version of minecraft to work with bukkit server so,
    1. make npm -> will install everything.
  
  Note: Makefile in root directory.
  
  This will put the mineflayer in the correct version.

Server
------

  1. server can be started by running java -Xms1G -Xmx1G -jar craftbukkit-1.6.4-R0.1-20130920.011648-1.jar -o false

Client
-------
  1. First unzip deps/Nodus.zip into Library/Application\ Support/minecraft/versions

  2. Start client using java -jar Minecraft\ Craked.jar
  2.1 In first login choose 'edit profile' and after in the versions choose nodus!

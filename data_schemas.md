Entry schemas
The schema of an entry's data depends on the category of the item.

Monster schema:

{ 
    "name": "...", // string; entry name
    "id": 0,  // integer; ID as shown in compendium
    "category": "...", // string; "monsters"
    "description": "...", // string; short paragraph
    "image": "...", // string; URL of image
    "common_locations": [], // array of strings or null for unknown; where the entry is commonly seen
    "drops": [], // array of strings or null for unknown; recoverable materials from killing
    "dlc": false // boolean; whether the entry is from a DLC pack
}
Equipment schema:

{ 
    "name": "...", // string; entry name
    "id": 0,  // integer; ID as shown in compendium
    "category": "...", // string; "equipment"
    "description": "...", // string; short paragraph
    "image": "...", // string; URL of image
    "common_locations": [], // array of strings or null for unknown; where the entry is commonly seen
    "properties": { 
        "attack": 0, // integer; damage the entry does (0 for sheilds and arrows)
        "defense": 0, // integer; defense the entry offers (0 for equipment that aren't shields)
        /* TEARS OF THE KINGDOM ONLY */
        "effect": "...", // string; special effect of the weapon (e.g. "wind razor"), empty if none
        "type": "..." // string; type of weapon (e.g. "one-handed weapon")
        /* */
    },
    "dlc": false // boolean; whether the entry is from a DLC pack

}
Material schema:

{
    "name": "...", // string; entry name
    "id": 0, // integer; ID as shown in compendium
    "category": "...", // string; "materials"
    "description": "...", // string; short paragraph
    "image": "...", // string; URL of image
    "common_locations": [], // array of strings or null for unknown; where the entry is commonly seen
    "hearts_recovered": 0.0, // float; health recovered when eaten raw
    "cooking_effect": "...", // string; special effect when used in a dish/elixir (e.g. "stamina recovery"), empty if none
    "dlc": false, // boolean; whether the entry is from a DLC pack
    /* TEARS OF THE KINGDOM ONLY */
    "fuse_attack_power": 0 // integer; damage added when fused with a weapon
    /* */
},
Creature schema:

Food (field "edible" is true):

{
    "name": "...", // string; entry name
    "id": 0, // integer; ID as shown in compendium
    "category": "...", // string; "creatures"
    "description": "...", // string; short paragraph
    "image": "...", // string; URL of image
    "cooking_effect": "...", // string; special effect when used in a dish/elixir (e.g. "stamina recovery"), empty if none
    "common_locations": [], // array of strings or null for unknown; where the entry is commonly seen
    "edible": true, // boolean; true, whether the creature can be eaten or incorporated into a dish/elixir
    "hearts_recovered": 0.0, // float; hearts recovered when eaten raw
    "dlc": false // boolean; whether the entry is from a DLC pack
}
Non-food (field "edible" is false):

{
    "name": "...", // string; entry name
    "id": 0, // integer; ID as shown in compendium
    "category": "...", // string; "creatures"
    "description": "...", // string; short paragraph
    "image": "...", // string; URL of image
    "common_locations": [], // array of strings or null for unknown; where the entry is commonly seen
    "edible": false, // boolean; false, whether the creature can be eaten or incorporated into a dish/elixir
    "drops": [], // array of strings or null for unknown; recoverable materials from killing
    "dlc": false // boolean; whether the entry is from a DLC pack
}
Treasure schema:

{ 
    "name": "...", // string
    "id": 0,  // integer; ID as shown in compendium
    "category": "...", // string; "treasure"
    "description": "...", // string; short paragraph
    "image": "...", // string; URL of image
    "common_locations": [], // array of strings or null for unknown; where the entry is commonly seen
    "drops": [], // array of strings or null for unknown; recoverable materials when accessed
    "dlc": false // boolean; whether the entry is from a DLC pack
}
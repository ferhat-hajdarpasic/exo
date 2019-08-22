//   exoTouch Haptic profile
/* See the code boxes further down to see how the variables in this array are defined. */

static gattAttribute_t exoTouchProfileAttrTbl[SERVAPP_NUM_ATTR_SUPPORTED] =     //simpleProfileAttrTbl
{// Simple Profile Service
  {{ ATT_BT_UUID_SIZE, primaryServiceUUID }, /* type */ GATT_PERMIT_READ, /* permissions */ 0,  (uint8 *)&exoTouchProfileService /* pValue */},
  // Characteristic Hapt1 Declaration
  {{ ATT_BT_UUID_SIZE, characterUUID }, GATT_PERMIT_READ, 0, &exoTouchProfileHapt1Props},
  // Characteristic Value Hapt1
  {{ ATT_BT_UUID_SIZE, exoTouchProfileHapt1UUID }, GATT_PERMIT_READ | GATT_PERMIT_WRITE, 0, &exoTouchProfileHapt1},	  
  // Characteristic Hapt2 Declaration
  {{ ATT_BT_UUID_SIZE, characterUUID }, GATT_PERMIT_READ, 0, &exoTouchProfileHapt2Props },
  // Characteristic Value Hapt2
  {{ ATT_BT_UUID_SIZE, exoTouchProfileHapt2UUID }, GATT_PERMIT_READ | GATT_PERMIT_WRITE, 0, &exoTouchProfileHapt2},
  // Characteristic Hapt16 Declaration
  {{ ATT_BT_UUID_SIZE, characterUUID }, GATT_PERMIT_READ, 0, &exoTouchProfileHapt16Props },
  // Characteristic Value Hapt16
  {{ ATT_BT_UUID_SIZE, exoTouchProfileHapt16UUID }, GATT_PERMIT_READ | GATT_PERMIT_WRITE, 0, &exoTouchProfileHapt16 } 
  // Characteristic ActiveHapt - 16 bit map active moto 
  {{ ATT_BT_UUID_SIZE, characterUUID }, GATT_PERMIT_READ, 0, &exoTouchProfileActiveActiveHaptProps },
  // Characteristic Value ActiveHapt
  {{ ATT_BT_UUID_SIZE, exoTouchProfileActiveHaptUUID }, GATT_PERMIT_READ | GATT_PERMIT_WRITE, 0, &exoTouchProfileActiveHapt } 
  // Characteristic Script Array Declaration
  // 4 bytes per Haptic Motor ; 64 bytes per x16 motor sets. 8 scripts in 512 bytes array.
  // Arrays 1 - 16     128 scripts
  {{ ATT_BT_UUID_SIZE, characterUUID }, GATT_PERMIT_READ, 0, &exoTouchProfileScriptArray1 },
  // Characteristic Value Script Array
  {{ ATT_BT_UUID_SIZE, exoTouchProfileScriptArray1UUID }, GATT_PERMIT_READ | GATT_PERMIT_WRITE, 0, &exoTouchProfileScriptArray1 } 
  //  * * *
  {{ ATT_BT_UUID_SIZE, characterUUID }, GATT_PERMIT_READ, 0, &exoTouchProfileScriptArray16 },
  // Characteristic Value Script Array
  {{ ATT_BT_UUID_SIZE, exoTouchProfileScriptArray16UUID }, GATT_PERMIT_READ | GATT_PERMIT_WRITE, 0, &exoTouchProfileScriptArray16 } 
} 
/* See the code boxes further down to see how the variables in this array are defined. */

static gattAttribute_t exoWandProfileAttrTbl[SERVAPP_NUM_ATTR_SUPPORTED] =     //simpleProfileAttrTbl
{
    // Simple Profile Service
    {{ ATT_BT_UUID_SIZE, primaryServiceUUID }, /* type */ GATT_PERMIT_READ,  /* permissions */ 0, /* handle */ (uint8 *)&exoWandProfileService /* pValue */},
    // Characteristic Moto1 Declaration
    {{ ATT_BT_UUID_SIZE, characterUUID }, GATT_PERMIT_READ, 0, &exoWandProfileMoto1Props},
    // Characteristic Value Moto1
    {{ ATT_BT_UUID_SIZE, exoWandProfileMoto1UUID }, GATT_PERMIT_READ | GATT_PERMIT_WRITE, 0, &exoWandProfileMoto1},
    // Characteristic Moto2 Declaration
    {{ ATT_BT_UUID_SIZE, characterUUID }, GATT_PERMIT_READ, 0, &exoWandProfileMoto2Props},
    // Characteristic Value Moto2
    {{ ATT_BT_UUID_SIZE, exoWandProfileMoto2UUID }, GATT_PERMIT_READ | GATT_PERMIT_WRITE, 0, &exoWandProfileMoto2 },
    // Characteristic Moto3 Declaration
    {{ ATT_BT_UUID_SIZE, characterUUID }, GATT_PERMIT_READ, 0, &exoWandProfileMoto3Props },
    // Characteristic Value Moto3
    {{ ATT_BT_UUID_SIZE, exoWandProfileMoto3UUID }, GATT_PERMIT_READ | GATT_PERMIT_WRITE, 0,&exoWandProfileMoto3},
    // Characteristic Thermo1 Declaration
    {{ ATT_BT_UUID_SIZE, characterUUID }, GATT_PERMIT_READ, 0, &exoWandProfileThermo1Props },
    // Characteristic Value Thermo1
    {{ ATT_BT_UUID_SIZE, exoWandProfileThermo1UUID }, GATT_PERMIT_READ | GATT_PERMIT_WRITE, 0, &exoWandProfileThermo1 } 
    // Characteristic Active Declaration active bits 0 - Moto1; 1 - Moto 2; 2 - Moto3 ; 3 - Thermo1
    {{ ATT_BT_UUID_SIZE, characterUUID }, GATT_PERMIT_READ, 0, &exoWandProfileActiveProps },
    // Characteristic Value Active
    {{ ATT_BT_UUID_SIZE, exoWandProfileActiveUUID }, GATT_PERMIT_READ | GATT_PERMIT_WRITE, 0, &exoWandProfileActive }   
    // Characteristic Script Array Declaration
    // 4 bytes per  Motor ; 4 bytes per  Thermo ;  16 bytes per x3 motor sets + 1 Thermo. 32 scripts in 512 bytes array.
    // Arrays 1 - 8     256 scripts
    {{ ATT_BT_UUID_SIZE, characterUUID }, GATT_PERMIT_READ, 0, &exoWandProfileScriptArray1 },
    // Characteristic Value Script Array
    {{ ATT_BT_UUID_SIZE, exoWandProfileScriptArray1UUID }, GATT_PERMIT_READ | GATT_PERMIT_WRITE, 0, &exoWandProfileScriptArray1 } 
    //  * * * 
    {{ ATT_BT_UUID_SIZE, characterUUID }, GATT_PERMIT_READ, 0, &exoWandProfileScriptArray8 },
    // Characteristic Value Script Array
    {{ ATT_BT_UUID_SIZE, exoWandProfileScriptArray8UUID }, GATT_PERMIT_READ | GATT_PERMIT_WRITE, 0, &exoWandProfileScriptArray8 } 
} 

static gattAttribute_t exoThrustProfileAttrTbl[SERVAPP_NUM_ATTR_SUPPORTED] =     //simpleProfileAttrTbl
{
  // Simple Profile Service
    {{ ATT_BT_UUID_SIZE, primaryServiceUUID }, /* type */ GATT_PERMIT_READ, /* permissions */ 0, /* handle */(uint8 *)&exoThrustProfileService/* pValue */},
    // Characteristic Moto1 Declaration
    {{ ATT_BT_UUID_SIZE, characterUUID }, GATT_PERMIT_READ, 0, &exoThrustProfileMoto1Props },
    // Characteristic Value Moto1
    {{ ATT_BT_UUID_SIZE, exoThrustProfileMoto1UUID }, GATT_PERMIT_READ | GATT_PERMIT_WRITE, 0, &exoThrustProfileMoto1},	  
    // Characteristic Moto2 Declaration
    {{ ATT_BT_UUID_SIZE, characterUUID }, GATT_PERMIT_READ, 0, &exoThrustProfileMoto2Props},
    // Characteristic Value Moto2
    {{ ATT_BT_UUID_SIZE, exoThrustProfileMoto2UUID }, GATT_PERMIT_READ | GATT_PERMIT_WRITE, 0, &exoThrustProfileMoto2},
    // Characteristic Active Declaration active bits 0 - Moto1; 1 - Moto 2; 
    {{ ATT_BT_UUID_SIZE, characterUUID }, GATT_PERMIT_READ, 0, &exoThrustProfileActiveProps },
    // Characteristic Value Active
    {{ ATT_BT_UUID_SIZE, exoThrustProfileActiveUUID }, GATT_PERMIT_READ | GATT_PERMIT_WRITE, 0, &exoThrustProfileActive}   
    // Characteristic Script Array Declaration
    // 4 bytes per  Motor ;    8 bytes per x2 motor sets   64 scripts in 512 bytes array.
    // Arrays 1 - 4     256 scripts		
    {{ ATT_BT_UUID_SIZE, characterUUID }, GATT_PERMIT_READ, 0, &exoThrustProfileScriptArray1 },
    // Characteristic Value Script Array
    {{ ATT_BT_UUID_SIZE, exoThrustProfileScriptArray1UUID }, GATT_PERMIT_READ | GATT_PERMIT_WRITE, 0, &exoThrustProfileScriptArray1} 	  
    //  * * * 
    {{ ATT_BT_UUID_SIZE, characterUUID }, GATT_PERMIT_READ, 0, &exoThrustProfileScriptArray4  },
    // Characteristic Value Script Array
    {{ ATT_BT_UUID_SIZE, exoThrustProfileScriptArray4UUID }, GATT_PERMIT_READ | GATT_PERMIT_WRITE, 0, &exoThrustProfileScriptArray4}  
}

export interface GuideTemplate {
  id: string
  title: string
  section: 'maintenance' | 'performance' | 'diagnosis'
  system: string
  description: string
  steps: string
}

export const GUIDE_TEMPLATES: GuideTemplate[] = [
  {
    id: 'oil_change',
    title: 'Engine Oil & Filter Change',
    section: 'maintenance',
    system: 'engine',
    description: 'Step-by-step engine oil and filter replacement.',
    steps: `1. Warm up the engine for a few minutes to help the oil drain fully, then shut it off and let it cool slightly.\n2. Raise and secure the vehicle safely on jack stands.\n3. Place a drain pan under the oil drain plug and remove the plug — allow oil to drain completely.\n4. Remove the old oil filter.\n5. Install the new oil filter — lightly oil the gasket before installing.\n6. Reinstall the drain plug with a new crush washer and torque to spec.\n7. Lower the vehicle and refill with the correct oil type and quantity for your engine.\n8. Start the engine and check for leaks around the drain plug and filter.\n9. Reset the service indicator (CBS) if applicable.`,
  },
  {
    id: 'spark_plugs',
    title: 'Spark Plug Replacement',
    section: 'maintenance',
    system: 'engine',
    description: 'Spark plug removal and installation.',
    steps: `1. Allow the engine to cool completely before starting.\n2. Remove the engine cover if present.\n3. Disconnect the ignition coils — label them if needed to ensure correct reinstallation.\n4. Remove the old spark plugs using a spark plug socket.\n5. Check the gap on the new plugs and adjust if necessary to your engine's spec.\n6. Install new spark plugs by hand first to avoid cross-threading, then torque to spec.\n7. Reinstall the ignition coils and ensure they click into place.\n8. Reinstall the engine cover.\n9. Clear any fault codes with a scanner if the engine light was on.`,
  },
  {
    id: 'air_filter_engine',
    title: 'Engine Air Filter Replacement',
    section: 'maintenance',
    system: 'engine',
    description: 'Engine air filter removal and replacement.',
    steps: `1. Locate the airbox — typically on the driver's side near the front of the engine bay.\n2. Release the airbox clips or unscrew the fasteners to open the housing.\n3. Remove the old air filter and note the orientation.\n4. Wipe out any debris from inside the airbox housing.\n5. Install the new filter in the correct orientation.\n6. Resecure the airbox housing and ensure all clips are fully seated.`,
  },
  {
    id: 'cabin_filter',
    title: 'Cabin Air Filter Replacement',
    section: 'maintenance',
    system: 'hvac',
    description: 'Cabin air filter (microfilter) removal and replacement.',
    steps: `1. Locate the cabin filter housing — typically behind the glove box or under the dashboard on the passenger side.\n2. Open or remove the housing cover.\n3. Slide out the old cabin filter and note the airflow direction arrow.\n4. Insert the new filter with the airflow arrow pointing in the correct direction.\n5. Resecure the housing cover.\n6. Reset the cabin filter service reminder if your vehicle has one.`,
  },
  {
    id: 'brake_fluid_flush',
    title: 'Brake Fluid Flush',
    section: 'maintenance',
    system: 'brakes',
    description: 'Full brake fluid flush and replacement.',
    steps: `1. Identify the correct brake fluid specification for your vehicle (typically DOT 4 or DOT 4 LV).\n2. Remove as much old fluid from the reservoir as possible using a fluid extractor.\n3. Refill the reservoir with fresh fluid.\n4. Starting at the wheel furthest from the master cylinder, open the bleed nipple and bleed until fresh fluid flows with no air bubbles.\n5. Repeat for each remaining caliper in order, working towards the master cylinder.\n6. Top up the reservoir to the MAX line.\n7. Check the brake pedal feel — it should be firm.\n8. Inspect all bleed nipples for leaks.`,
  },
  {
    id: 'coolant_flush',
    title: 'Coolant Flush',
    section: 'maintenance',
    system: 'cooling',
    description: 'Cooling system drain, flush, and refill.',
    steps: `1. Allow the engine to cool completely — never open the coolant system on a hot engine.\n2. Place a drain pan under the radiator drain plug or lower radiator hose.\n3. Drain the old coolant completely.\n4. Flush the system with distilled water — refill, run briefly, drain again.\n5. Refill with the correct coolant mixture for your engine (typically 50/50 BMW coolant and distilled water).\n6. Bleed the cooling system by opening the bleed screws and running the engine with the heater on full until the thermostat opens.\n7. Top up as needed and check for leaks.\n8. Reset the coolant service reminder if applicable.`,
  },
  {
    id: 'transmission_fluid',
    title: 'Transmission Fluid Change',
    section: 'maintenance',
    system: 'drivetrain',
    description: 'Automatic or manual transmission fluid drain and refill.',
    steps: `1. Warm up the transmission by driving briefly — warm fluid drains more completely.\n2. Raise and secure the vehicle safely.\n3. Place a drain pan under the transmission drain plug.\n4. Remove the drain plug and allow fluid to drain fully.\n5. Replace the drain plug washer and reinstall the drain plug — torque to spec.\n6. Refill with the correct fluid type and quantity for your transmission.\n7. Check the fluid level using the correct procedure for your transmission type.\n8. Lower the vehicle and check for leaks.`,
  },
  {
    id: 'brake_pads',
    title: 'Brake Pad Replacement',
    section: 'maintenance',
    system: 'brakes',
    description: 'Front or rear brake pad removal and installation.',
    steps: `1. Loosen the lug bolts slightly before jacking up the vehicle.\n2. Raise and secure the vehicle on jack stands.\n3. Remove the wheel.\n4. Inspect the rotor for wear, scoring, or minimum thickness.\n5. Compress the caliper piston fully using a caliper wind-back tool — note whether the rear calipers require rotation to compress.\n6. Remove the caliper guide bolts and slide the caliper off — hang it with a wire hook, do not let it hang by the brake hose.\n7. Remove the old brake pads and note any shim placement.\n8. Clean the caliper bracket and apply brake grease to the pad contact points.\n9. Install the new pads with any shims in the correct orientation.\n10. Reinstall the caliper and torque guide bolts to spec.\n11. Reinstall the wheel and torque lug bolts to spec.\n12. Pump the brake pedal until firm before moving the vehicle.\n13. Bed in the new pads following the manufacturer's bedding procedure.`,
  },
  {
    id: 'battery_replacement',
    title: 'Battery Replacement',
    section: 'maintenance',
    system: 'electrical',
    description: 'Battery removal, installation, and DME registration.',
    steps: `1. Turn off the vehicle and remove the key.\n2. Disconnect the negative terminal first, then the positive terminal.\n3. Remove any battery hold-down bracket.\n4. Remove the old battery — note it may be heavy.\n5. Clean the battery terminals and tray if there is any corrosion.\n6. Install the new battery in the correct orientation.\n7. Reconnect the positive terminal first, then the negative terminal.\n8. Register the new battery with the DME using a compatible scanner (required on most E60, F10, and G30 models to ensure correct charging profile).\n9. Check that all electrical systems are functioning correctly.`,
  },
  {
    id: 'drive_belt',
    title: 'Drive Belt Replacement',
    section: 'maintenance',
    system: 'engine',
    description: 'Serpentine / accessory drive belt removal and installation.',
    steps: `1. Photograph or sketch the current belt routing before removal for reference.\n2. Locate the belt tensioner — use a breaker bar or tensioner tool to release tension.\n3. Slide the old belt off the pulleys.\n4. Inspect all pulleys and the tensioner for wear or bearing play — replace if needed.\n5. Route the new belt according to the routing diagram, leaving the tensioner pulley for last.\n6. Release the tensioner onto the belt.\n7. Verify the belt is correctly seated in all pulley grooves.\n8. Start the engine briefly and check belt tracking and tension.`,
  },
]

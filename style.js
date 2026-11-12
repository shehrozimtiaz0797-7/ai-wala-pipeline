// AI Wala (Urdu horror) — art style, the "YOU" figure, and story settings.
// These words are added to every picture prompt so every video has the same look.
module.exports = {
  style:
    'dark cinematic 3D render, eerie liminal atmosphere, low-key moody lighting, deep shadows, ' +
    'desaturated cold blue and black colours with one small dim red accent light, light volumetric fog, ' +
    'film grain, unsettling quiet mood, psychological horror, no gore, no text, no letters, no watermark',

  // The viewer ("aap") is always shown as the same faceless figure.
  you:
    'YOU: a faceless smooth pale-grey mannequin-like human figure with a plain blank head and no facial features, ' +
    'wearing a dark hoodie and dark trousers',

  // Strange beings are always faceless or hidden, never gory.
  creature:
    'a tall thin faceless shadowy figure, silhouette only, partly hidden in darkness',

  // Where the stories happen. The story writer picks one when no topic is given.
  // (No religion, no real places or brands.)

  // Outdoor and rural places got the most views for the sister channel, so these are picked more often.
  settingsHot: [
    'a boys hostel room at night where the previous student left rules on the wall',
    'a college building at night where the chowkidar leaves rules about the third floor',
    'a hostel corridor after midnight where the warden leaves rules before locking up',
    'a lake rest house at night where the caretaker leaves rules about the water',
    'a village haveli at night where the old caretaker leaves rules about the courtyard',
    'a sugarcane field at night where the farmer gives you rules before he leaves',
    'a long empty mountain road where the dhaba owner leaves rules for the night',
    'an old railway station platform at 2 AM where the station master gives you a list',
    'an abandoned fairground (mela) that you must lock up alone',
    'a canal-side rest house where the watchman leaves rules about the water',
    'an orchard at night where the keeper tells you never to count the trees',
    'an attic in your grandmother\'s old house with rules written inside the door',
    'an empty cricket ground at night where the groundsman leaves rules about the pavilion',
    'a village well where the elders leave you rules about the rope',
    'a forest rest house where the guard leaves rules about the path behind it',
    'a night bus on a motorway where the conductor tells you never to look at the last seat'
  ],
  settings: [
    'your first night shift alone at a petrol pump on a long empty motorway',
    'an old haveli where the caretaker gives you a list of rules for the upper floor',
    'a hostel room at midnight with rules written on the wall by the previous student',
    'a late-night intercity bus where the conductor tells you never to look at the last seat',
    'a hospital night shift on a floor that was closed years ago',
    'a night guard job at an empty shopping plaza',
    'an elevator in an office tower at 3 AM that has an extra floor button',
    'a rented flat where the landlord leaves rules about the neighbour upstairs',
    'a night flight where the flight attendant hands you a list of rules',
    'a university library basement at night with rules about the last row of shelves',
    'a village guest house where the host leaves rules about the courtyard well after dark',
    'a road trip where the phone GPS starts giving you rules instead of directions',
    'a wedding hall after midnight where the last staff member must lock up alone',
    'an old cinema hall night cleaning shift with rules about seat 13',
    'a call centre night shift where the headset gets strange calls after 2 AM',
    'a night train that stops at a station that is not on your ticket',
    'a snowed-in mountain rest house with rules carved inside the door',
    'a night boat ride across a lake where the boatman gives you rules',
    'grandmother\'s old house where she leaves strict rules about the attic',
    'a night watchman job at an empty college building with rules about the third floor'
  ]
};

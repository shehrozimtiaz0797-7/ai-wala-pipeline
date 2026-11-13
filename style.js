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
    'your first night shift as a railway crossing gateman on a lonely village line',
    'your first night shift as a guard at a dam control room',
    'your first night shift as a guard at a power house (bijli ghar)',
    'your first night shift driving the last highway bus with only a few passengers',
    'your first night shift at a toll plaza on an empty motorway',
    'your first night shift as a chowkidar at a cold storage warehouse',
    'your first night shift at a roadside tea stall (dhaba) near a railway station',
    'your first night shift as a mobile tower technician on a hilltop',
    'your first night shift as a watchman at a brick kiln outside the village',
    'your first night shift as a ward boy in a government hospital basement',
    'your first night shift as a guard at a closed wedding hall',
    'your first night shift as a watchman at a forest watchtower',
    'your first night shift as an operator at a river ferry ghat',
    'your first night shift as a guard at a godown full of old furniture',
    'your first night shift as a metro station cleaner after the last train',
    'your first night shift as a security guard at a construction site',
    'your first night shift at a 24-hour medical store on a dark road',
    'your first night shift as a night watchman at a sugar mill'
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

// AI Wala (Urdu horror) — art style, the "YOU" figure, and story settings.
// These words are added to every picture prompt so every video has the same look.
module.exports = {
  // Nov 2026: cartoon test. Hindi/Urdu 'bhoot wala cartoon' horror Shorts get 1-4M views; the old dark 3D look did not.
  style:
    '2D cartoon animation still, Indian horror cartoon style (bhoot wala cartoon), flat bold colours, thick clean black outlines, ' +
    'simple cel shading, spooky night scene, deep blue and purple night, glowing yellow moon or lantern light, eerie green glow, ' +
    'creepy but not gory, expressive cartoon acting, no text, no letters, no watermark',

  // The viewer ("aap") is always shown as the same faceless figure.
  you:
    'YOU: the same cartoon young South Asian man in every picture, plain white kurta and dark trousers, short black hair, ' +
    'simple flat cartoon face with big round expressive eyes, slim build',

  // Strange beings are always faceless or hidden, never gory.
  creature:
    'a spooky cartoon ghost (bhoot or chudail) with glowing white eyes, dark flowing shape and long messy hair, creepy not gory',

  // Where the stories happen. The story writer picks one when no topic is given.
  // (No religion, no real places or brands.)

  // Outdoor and rural places got the most views for the sister channel, so these are picked more often.
  // Desi folklore creature encounters (no religion). In Nov 2026 this kind of 'True Horror Story'
  // got 1-4M views on Hindi/Urdu Shorts channels (chudail on the bike, naag with human eyes).
  creatures: [
    'riding your motorbike home at night on a village road when an old woman with a lantern (chudail) silently sits on the back seat',
    'a woman in white with backward feet waving for a lift on an empty highway at 2 AM',
    'a black snake with human eyes that waits outside your door every night after the electricity goes',
    'the last seat of a night bus where a passenger with no shadow always sits',
    'a village well where someone calls your name in your mother\'s voice after midnight',
    'a sugarcane field where a tall figure follows you just behind the crop line',
    'a lonely banyan tree on your way home where a woman combs her long hair at night',
    'a night train passenger who asks you the time again and again, and his face changes each time',
    'a goat that follows you home at night and starts talking when you lock the door',
    'a wedding procession (baraat) in the middle of the night on a road with no village',
    'a fruit seller on the highway at 3 AM whose fruit is always fresh but whose cart has no wheels',
    'an old haveli guard who warns you that the bride on the stairs is not a guest'
  ],

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

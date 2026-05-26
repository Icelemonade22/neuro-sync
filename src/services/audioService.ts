import { Audio } from "expo-av";

let sound: Audio.Sound | null = null;

export async function playSound(source: any) {
  try {
    if (sound) {
      await sound.unloadAsync();
    }

    const { sound: newSound } = await Audio.Sound.createAsync(source, {
      shouldPlay: true,
      isLooping: true,
    });

    sound = newSound;
  } catch (error) {
    console.log("Audio Error:", error);
  }
}

export async function stopSound() {
  try {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      sound = null;
    }
  } catch (error) {
    console.log(error);
  }
}

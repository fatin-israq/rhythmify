console.log("Javascript is running");

async function getSongs() {
  // Fetch response from the server
  let a = await fetch("http://127.0.0.1:5500/musics/");
  let response = await a.text();
  //   console.log(response);

  // Create a temporary div to parse the response as HTML
  let div = document.createElement("div");
  div.innerHTML = response;

  // Extract <a> elements
  let as = div.getElementsByTagName("a");
  let songs = [];

  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split("/musics/")[1]);
    }
  }
  return songs;
}

async function main() {
  // Get the list of all the songs
  let songs = await getSongs();
  console.log(songs);

  let songUL = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];
  for (const song of songs) {
    console.log(song);

    songUL.innerHTML =
      songUL.innerHTML +
      `
        <li>
                <img
                  class="invert"
                  src="images/icons/music.svg"
                  alt="Music Icon"
                />
                <div class="info">
                  <div>${song.replaceAll("%20", " ")}</div>
                  <div>1sraQ</div>
                </div>
                <div class="playnow">
                  <span>Play now</span>
                  <img class="invert" src="images/icons/play.svg" alt="Play Now" />
                </div>
              </li>`;
  }

  // play the first song
  let audio = new Audio(songs[0]);
  // audio.play()
}

main();

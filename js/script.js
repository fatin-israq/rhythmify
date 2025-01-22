console.log("Javascript is running > Successful Dev: 1sraQ");
let currentSong = new Audio();

function formatTime(seconds) {
  // Ensure seconds is a whole number
  seconds = Math.floor(seconds);

  // Calculate minutes and remaining seconds
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  // Format seconds to always show two digits
  const formattedSeconds =
    remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;

  // Return the formatted time
  return `${minutes}:${formattedSeconds}`;
}

async function getSongs() {
  // Fetch response from the server
  let a = await fetch("http://127.0.0.1:5500/musics/");
  let response = await a.text();
  // console.log(response);

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

const playMusic = (track, pause = false) => {
  currentSong.src = "/musics/" + track;
  if (!pause) {
    // pause == false
    currentSong.pause();
    play.src = "/images/icons/play.svg";
  } else {
    // pause == true
    currentSong.play();
    play.src = "/images/icons/pause.svg";
  }

  // Replace content in songinfo
  document.querySelector(".songinfo").innerHTML =
    "<strong>" + decodeURI(track) + "</strong>";

  // Replace content in songtime
  document.querySelector(".songtime").innerHTML = "<span>00:00 / 00:00</span>";
};

async function main() {
  // Get the list of all the songs
  let songs = await getSongs();
  currentSong.src = songs[0];
  // console.log(songs);

  // Show all the songs in the playlist
  let songUL = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];
  for (const song of songs) {
    // console.log(song);

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

  // Attach an event listener to each song
  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      // console.log(e.querySelector(".info").firstElementChild.innerHTML);
      playMusic(e.querySelector(".info").firstElementChild.innerHTML, true);
    });
  });

  if (songs.length > 0) {
    playMusic(songs[0]);
  }

  // Attach an event listener to play, next and previous (play, next, previous are ids)
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "images/icons/pause.svg";
    } else {
      currentSong.pause();
      play.src = "images/icons/play.svg";
    }
  });

  // Listen for timeupdate event
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${formatTime(
      currentSong.currentTime
    )} / ${formatTime(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  // Add an event listener to seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });
}

main();
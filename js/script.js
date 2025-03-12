let currentSong = new Audio();
let songs;
let currFolder;

function formatTime(seconds) {
  // Ensure seconds is a whole number
  seconds = Math.floor(seconds);

  // Calculate minutes and remaining seconds
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  // Format seconds to always show two digits
  const formattedSeconds =
    remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;

  if (isNaN(remainingSeconds) || seconds < 0) {
    return "0:00";
  }

  // Return the formatted time
  return `${minutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
  currFolder = folder;
  // Fetch response from the server
  let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
  let response = await a.text();
  // console.log(response);

  // Create a temporary div to parse the response as HTML
  let div = document.createElement("div");
  div.innerHTML = response;

  // Extract <a> elements
  let as = div.getElementsByTagName("a");
  songs = [];

  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }

  // Show all the songs in the playlist
  let songUL = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];
  songUL.innerHTML = "";
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

  return songs;
}

const playMusic = (track, pause = false) => {
  currentSong.src = `/${currFolder}/` + track;
  if (pause) {
    // pause == false
    currentSong.pause();
    play.src = "/images/icons/play.svg";
  } else {
    // pause == true
    // currentSong.play();
    play.src = "/images/icons/pause.svg";
  }

  // Replace content in songinfo
  document.querySelector(".songinfo").innerHTML =
    "<strong>" + decodeURI(track) + "</strong>";

  // Replace content in songtime
  document.querySelector(".songtime").innerHTML = "<span>00:00 / 00:00</span>";
};

async function displayAlbums() {
  let a = await fetch(`http://127.0.0.1:5500/musics/`);
  let response = await a.text();
  // console.log(response);

  // Create a temporary div to parse the response as HTML
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cardContainer");
  Array.from(anchors).forEach(async (e) => {
    if (e.href.includes("/musics")) {
      // console.log(e.href);
      let folder = e.href.split("/").slice(-2)[1];
      if (folder !== "musics") {
        // console.log(folder);
        // Get the metadata of the folder
        a = await fetch(`http://127.0.0.1:5500/musics/${folder}/info.json`);
        response = await a.json();
        // console.log(response);
        cardContainer.innerHTML =
          cardContainer.innerHTML +
          `<div data-folder="${folder}" class="card">
              <div class="play">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  color="#000000"
                  fill="same"
                >
                  <path
                    d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>

              <img
                src="/musics/${folder}/cover.jpg"
                alt=""
              />
              <h2>${response.title}</h2>
              <p>${response.description}</p>
            </div>`;
      }
    }

     // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach((e) => {
      e.addEventListener("click", async (item) => {
        songs = await getSongs(`musics/${item.currentTarget.dataset.folder}`);
        playMusic(songs[0]);
      });
    });
  });
}

async function main() {
  // Get the list of all the songs
  songs = await getSongs("musics/ncs");
  currentSong.src = songs[0];
  // console.log(songs);

  if (songs.length > 0) {
    playMusic(songs[0]);
  }

  // Display all the albums on the page
  displayAlbums();

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

  // Add an event listener for hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = 0;
  });

  // Add an event listener for closing hamburger
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = -120 + "%";
  });

  // Add an event listener to previous and next
  previous.addEventListener("click", () => {
    // console.log("Previous clicked");
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });

  next.addEventListener("click", () => {
    // console.log("Next clicked");
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    } else {
      playMusic(songs[0]);
    }
  });

  // Add an event to volume
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      currentSong.volume = parseInt(e.target.value) / 100;
    });
}

main();

// Still have a problem in playMusic()

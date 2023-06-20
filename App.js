// movies-movies list, allMoviesGrid- grid to render movies, favMovies - list of favourite movies, favGrid-to render favMovies
var movies = [],
  allMoviesGrid,
  favMovies,
  favGrid;
//regex - contains symbols which should not be in the search string
const regex = /[!@#$%^&*(),.?":{}|<>]/g;

// ----------------------------------------------------
//movie class to create each movie object, also with method addToFavorite,removeFromFavorite
class Movie {
  constructor(id, title, releaseDate, ratings, voteCount, posterPath) {
    this.id = id;
    this.title = title;
    this.releaseDate = releaseDate;
    this.ratings = ratings;
    this.voteCount = voteCount;
    this.posterPath = posterPath;
  }
  //to add new movie to the favMovies list
  addToFavorite() {
    favMovies.push(this);
    localStorage.setItem("favMovies", JSON.stringify(favMovies));
    reRenderCardGrid(favMovies, favGrid);
  }

  //remove movie from the favMovies list, set text to "Add to Favorites"
  removeFromFavorite() {
    favMovies = favMovies.filter((movie) => movie.id !== this.id);
    localStorage.setItem("favMovies", JSON.stringify(favMovies));
    reRenderCardGrid(favMovies, favGrid);
    document.getElementById(`${this.id}-allMoviesGrid`).innerText =
      "Add to Favorites";
  }
}

// ----------------------------------------------------------------

//fetchData -fetchs data from api
const fetchData = async () => {
  //favGrid-reference to the favorite-grid
  favGrid = document.getElementById("favorite-grid");
  //gets favMovies list from local storage -else- empty []
  favMovies = JSON.parse(localStorage.getItem("favMovies")) ?? [];
  //renders the favMovies in the favGrid
  reRenderCardGrid(favMovies, favGrid);
  //ref to the allMoviesGrid
  allMoviesGrid = document.getElementById("all-movies-grid");
  try {
    const res = await fetch(
      "https://api.themoviedb.org/3/movie/top_rated?api_key=f531333d637d0c44abc85b3e74db2186&language=en-US&page=1"
    );
    const movieData = await res.json();
    movieData.results.forEach((movie) => {
      movies.push(
        new Movie(
          movie.id,
          movie.title,
          movie.release_date,
          movie.vote_average,
          movie.vote_count,
          movie.poster_path
        )
      );
    });
    sortMovies({ value: "rating-desc" });
  } catch (err) {
    allMoviesGrid.innerText = "API failed and please contact the administrator";
  }
};

// ----------------------------------------------------------

const showMore = ({ metadata, showMoreBtn }) => {
  showMoreBtn.innerText =
    showMoreBtn.innerText === "Show More" ? "Show less" : "Show More";
  metadata.style.display =
    metadata.style.display === "block" ? "none" : "block";
};

// ----------------------------------------------------------------

const createMovieCard = (movie, cardGrid) => {
  const { id, title, releaseDate, ratings, voteCount, posterPath } = movie;
  const card = document.createElement("div");
  card.classList.add("card");
  const poster = document.createElement("img");
  poster.src = posterPath
    ? `https://image.tmdb.org/t/p/w500${posterPath}`
    : "https://w7.pngwing.com/pngs/116/765/png-transparent-clapperboard-computer-icons-film-movie-poster-angle-text-logo-thumbnail.png";
  const movieTitle = document.createElement("h3");
  movieTitle.innerText = title;
  const favoriteBtn = document.createElement("button");
  favoriteBtn.id = `${id}-${
    cardGrid === allMoviesGrid ? "allMoviesGrid" : "favGrid"
  }`;
  favoriteBtn.className = "btn btn-primary btn-md";
  favoriteBtn.style.cssText = `
display: block;
margin: auto;
margin-bottom: 0.5em;
`;
  favoriteBtn.innerText = generateFavBtnText(cardGrid, id);
  favoriteBtn.addEventListener("click", () =>
    toggleFavMovies({ movie, favoriteBtn })
  );
  const metadata = document.createElement("div");
  metadata.style.display = "none";
  const relDate = document.createElement("div");
  relDate.innerText = `Release Date-${releaseDate}`;
  const rate = document.createElement("div");
  rate.innerText = `Avg Rating-${ratings}`;
  const vote = document.createElement("div");
  vote.innerText = `Number of Ratings-${voteCount}`;
  metadata.append(relDate, rate, vote);
  const showMoreBtn = document.createElement("button");
  showMoreBtn.className = "btn btn-primary btn-md";
  showMoreBtn.style.cssText = `
display: block;
margin: auto;
`;
  showMoreBtn.innerText = "Show More";
  showMoreBtn.addEventListener("click", () =>
    showMore({ metadata, showMoreBtn })
  );
  card.append(poster, movieTitle, favoriteBtn, metadata, showMoreBtn);
  cardGrid.appendChild(card);
};

// ---------------------------------------------------------------

const generateFavBtnText = (cardGrid, id) => {
  if (cardGrid === allMoviesGrid) {
    return favMovies.find((movie) => movie.id === id)
      ? "Remove from Favorites"
      : "Add to Favorites";
  } else {
    return "Remove from Favorites";
  }
};

// ------------------------------------

const reRenderCardGrid = (updatedMoviesList, movieGrid) => {
  movieGrid.innerHTML = "";
  updatedMoviesList.forEach((movie) => createMovieCard(movie, movieGrid));
};

// -----------------------------------------
const searchMovies = (elem) => {
  if (regex.test(elem.value)) {
    alert("Invalid search");
  } else {
    const filteredMovies = movies.filter((movie) =>
      movie.title.toLowerCase().includes(elem.value.toLowerCase())
    );
    if(filteredMovies.length == 0){
      allMoviesGrid.innerText = "No Match found!!"
    }
    else{

      reRenderCardGrid(filteredMovies, allMoviesGrid);
    }

  }
};

// ------------------------------------------
const sortByRating = (sortOrder) => {
  const sortedMovies = movies.sort((movie1, movie2) =>
    sortOrder === "asc"
      ? movie1.voteCount - movie2.voteCount
      : movie2.voteCount - movie1.voteCount
  );
  reRenderCardGrid(sortedMovies, allMoviesGrid);
};

// ---------------------------------------------
const sortByRelease = (sortOrder) => {
  const sortedMovies = movies.sort((movie1, movie2) =>
    sortOrder === "asc"
      ? movie1.releaseDate.localeCompare(movie2.releaseDate)
      : movie2.releaseDate.localeCompare(movie1.releaseDate)
  );
  reRenderCardGrid(sortedMovies, allMoviesGrid);
};

// -----------------------------------------------
const sortMovies = (elem) => {
  switch (elem.value) {
    case "rating-desc":
      sortByRating("desc");
      break;
    case "rating-asc":
      sortByRating("asc");
      break;
    case "release-desc":
      sortByRelease("desc");
      break;
    case "release-asc":
      sortByRelease("asc");
      break;
  }
};

// ---------------------------------------------------
const toggleFavMovies = ({ movie, favoriteBtn }) => {
  if (favoriteBtn.innerText === "Add to Favorites") {
    favoriteBtn.innerText = "Remove from Favorites";
    movie.addToFavorite();
  } else {
    favoriteBtn.innerText = "Add to Favorites";
    movie.removeFromFavorite();
  }
};


//https://github.com/alekspopovic/star-rating/tree/main/src
import Stars from "./Star";

function starComp() {
  const defaultRating = localStorage.getItem("starRating");

  return (
    <div>
      <Stars iconSize={25} defaultRating={defaultRating} />
    </div>
  );
}

export default starComp;
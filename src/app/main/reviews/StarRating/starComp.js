//https://github.com/alekspopovic/star-rating/tree/main/src
import Stars from "./page";

function starComp({recipe}) {
  const defaultRating = localStorage.getItem("starRating");

  return (
    <div>
      <Stars iconSize={25} defaultRating={defaultRating} itemTitle={recipe.title} itemId={recipe.Id}/>
    </div>
  );
}

export default starComp;
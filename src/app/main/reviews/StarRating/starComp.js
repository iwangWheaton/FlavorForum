//https://github.com/alekspopovic/star-rating/tree/main/src
import Stars from "./page";

function starComp({itemtitle}) {
  //const defaultRating = localStorage.getItem("starRating");

  return (
    <div>
      <Stars iconSize={25} itemtitle={itemtitle || "Unknown Title"} /**userId={userId}*//>
    </div>
  );
}

export default starComp;
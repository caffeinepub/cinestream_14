import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Float "mo:core/Float";
import Principal "mo:core/Principal";

module {
  type OldMovie = {
    id : Nat;
    title : Text;
    description : Text;
    genre : Text;
    year : Nat;
    rating : Float;
    duration : Nat;
    thumbnailUrl : Text;
    videoUrl : Text;
    isFeatured : Bool;
    categories : [Text];
  };

  type OldActor = {
    nextMovieId : Nat;
    movies : Map.Map<Nat, OldMovie>;
    watchlists : Map.Map<Principal, List.List<Nat>>;
    tmdbWatchlists : Map.Map<Principal, List.List<Nat>>;
    continueWatching : Map.Map<Principal, List.List<{ movieId : Nat; progressSeconds : Nat }>>;
    userProfiles : Map.Map<Principal, { name : Text }>;
    genreScores : Map.Map<Principal, Map.Map<Nat, Nat>>;
  };

  type NewMovie = {
    id : Nat;
    title : Text;
    description : Text;
    genre : Text;
    year : Nat;
    rating : Float;
    duration : Nat;
    thumbnailUrl : Text;
    videoUrl : Text;
    isFeatured : Bool;
    isPremium : Bool;
    categories : [Text];
  };

  type NewActor = {
    nextMovieId : Nat;
    movies : Map.Map<Nat, NewMovie>;
    watchlists : Map.Map<Principal, List.List<Nat>>;
    tmdbWatchlists : Map.Map<Principal, List.List<Nat>>;
    continueWatching : Map.Map<Principal, List.List<{ movieId : Nat; progressSeconds : Nat }>>;
    userProfiles : Map.Map<Principal, { displayName : Text; avatarUrl : Text }>;
    genreScores : Map.Map<Principal, Map.Map<Nat, Nat>>;
    subscriptions : Map.Map<Principal, { plan : Text; paymentId : Text; startDate : Int; expiryDate : Int }>;
  };

  public func run(old : OldActor) : NewActor {
    let newMovies = old.movies.map<Nat, OldMovie, NewMovie>(
      func(_id, oldMovie) {
        { oldMovie with isPremium = false };
      },
    );

    let newUserProfiles = old.userProfiles.map<Principal, { name : Text }, { displayName : Text; avatarUrl : Text }>(
      func(_principal, oldProfile) {
        {
          displayName = oldProfile.name;
          avatarUrl = "";
        };
      }
    );

    { old with movies = newMovies; userProfiles = newUserProfiles; subscriptions = Map.empty<Principal, { plan : Text; paymentId : Text; startDate : Int; expiryDate : Int }>() };
  };
};

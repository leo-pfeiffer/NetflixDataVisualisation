// data path for main data set
export const dataPath = "data/netflix_clean.csv"

export const geoDataPath = "data/geo.csv"

export const rowConverter = function(d) {

    let country = d.country.split(', ')
    let listed_in = d.listed_in.split(', ')
    let director = d.director.split(', ')
    let cast = d.cast.split(', ')

    d.country = country
    d.listed_in = listed_in
    d.director = director
    d.cast = cast

    return d;
};

// data path for main data set
export const dataPath = "data/netflix_clean.csv"

// data path for the geo locations data.
// Attribution: https://github.com/google/dspl/blob/master/samples/google/canonical/countries.csv
export const geoDataPath = "data/geo.csv"

/**
 * Split the rows of columns that contain comma separated values into arrays.
 * */
export const dataSplit = function(data) {
    data = data.map(el => {
        el.country = el.country.split(', ');
        el.director = el.director.split(', ');
        el.cast = el.cast.split(', ');
        el.listed_in = el.listed_in.split(', ');
        return el;
    })
    return data;
}

/**
 * Extract an array of the unique genres from the data set.
 * */
export const getUniqueGenres = function(data) {
    return data.map(el => el.listed_in).reduce((a, b) => a.concat(b))
        .filter((v, i, self) => self.indexOf(v) === i).filter(el => el !== "NA")
}

/**
 * Extract an array of the unique production countries from the data set.
 * */
export const getUniqueCountries = function(data) {
    return data.map(el => el.country).reduce((a, b) => a.concat(b))
        .filter((v, i, self) => self.indexOf(v) === i).filter(el => el !== "NA")
}
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

export const getUniqueGenres = function(data) {
    return data.map(el => el.listed_in).reduce((a, b) => a.concat(b))
        .filter((v, i, self) => self.indexOf(v) === i).filter(el => el !== "NA")
}

export const getUniqueCountries = function(data) {
    return data.map(el => el.country).reduce((a, b) => a.concat(b))
        .filter((v, i, self) => self.indexOf(v) === i).filter(el => el !== "NA")
}
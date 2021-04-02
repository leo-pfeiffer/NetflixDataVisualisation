// data path for main data set
export const dataPath = "data/netflix_clean.csv"

export const geoDataPath = "data/geo.csv"

/**
 * Group data by type (show vs movie) and date added.
 * */
export const groupData = function(data) {
    d3.nest()
        .key((d) => {
            return d.type;
        })
        .key((d) => {
            return new Date(d.date_added);
        })
        .rollup((v) => {
            return v.length;
        })
        .entries(data)
}
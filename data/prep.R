library(readr)
geo <- read_csv("country-by-geo-cordinations.csv")
netflix <- read_csv("netflix_titles.csv")

# Split country
count_countries <- function(x) {
    return(length(trimws(strsplit(x, ',', fixed = T)[[1]])))
}

getUniqueCountries <- function() {
    countries <- c()

    for (c in netflix$country) {
        countries <- c(countries, trimws(strsplit(c, ',', fixed = T)[[1]]))
    }

    return(unique(countries))
}

getUnmatchedCountries <- function(check, against) {
    unmatched <- c()
    for (c in check) {
        if (!(c %in% against)) {
            print(c)
            unmatched <- c(unmatched, c)
        }
    }
    return (unmatched)
}

uniqueCountries <- getUniqueCountries()
unmatched <- getUnmatchedCountries(uniqueCountries, as.character(geo$country))

replaceInArray <- function(arrayIn, valueToReplace, newValue) {
    newList <- c()
    for (el in arrayIn) {
        if (el != valueToReplace) newList <- c(newList, el)
        else newList <- c(newList, newValue)
    }
    return (newList)
}

fixUnmatched <- function(x) {

    listed <- trimws(strsplit(x, ',', fixed = T)[[1]])

    if ("Soviet Union" %in% listed) {
        listed <- replaceInArray(listed, "Soviet Union", "Russia")
    }
    if ("West Germany" %in% listed) {
        listed <- replaceInArray(listed, "West Germany", "Germany")
    }
    if ("East Germany" %in% listed) {
        listed <- replaceInArray(listed, "East Germany", "Germany")
    }

    returnVal <- paste(listed, collapse = ', ')

    return (ifelse(returnVal != "NA", returnVal, NA))
}

# Fix unmatched
netflix$country <- sapply(as.character(netflix$country), function(x) fixUnmatched(x))

# Fix cleaned data
write.csv(netflix, "netflix_clean.csv")


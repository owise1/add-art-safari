/*
 * used for safari storage
 */
localforage.config({
    driver      : localforage.WEBSQL, // Force WebSQL; same as using setDriver()
    name        : 'add-art',
    version     : 1.0,
    size        : 104857600 * 0.5, // Size of database, in bytes. WebSQL-only for now.
    storeName   : 'add_art', // Should be alphanumeric, with underscores.
    description : 'replacing ads with art'
});

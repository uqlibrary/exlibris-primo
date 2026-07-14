interface CacheEntry {
    expiryDate: number;
    courseCode: string;
}
type Cache = Record<string, CacheEntry>;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const TEN_MINUTES_MS = 10 * 60 * 1000;

class LocalStorageCacheManager {
    private static instance: LocalStorageCacheManager;
    private static expiryPeriodMilliseconds: number;
    private static cacheName: string;
    private cache: Cache = {};

    private static windowCacheExpiry: number = 0;

    // no constructor on singleton
    private constructor() {}

    public static getInstance(cacheName: string, expiryPeriodMilliseconds: number): LocalStorageCacheManager {
        console.log('cache### ### getInstance', cacheName);
        if (!LocalStorageCacheManager.instance) {
            LocalStorageCacheManager.expiryPeriodMilliseconds = expiryPeriodMilliseconds;
            LocalStorageCacheManager.cacheName = cacheName;
            console.log('cache### ### new cache manager');
            LocalStorageCacheManager.instance = new LocalStorageCacheManager();

            LocalStorageCacheManager.windowCacheExpiry = Date.now() +  TEN_MINUTES_MS; // we ensure we look at actual localstorage occasionally
        }
        return LocalStorageCacheManager.instance;
    }

    // write all the talis entries in one local storage entry
    public saveLocalStorageCache(cache: Cache) {
        try {
            console.log('cache### saveLocalStorageCache cache=', LocalStorageCacheManager.cacheName, cache);
            localStorage.setItem(LocalStorageCacheManager.cacheName, JSON.stringify(cache));
        } catch (e) {
            // localStorage might be full or unavailable; fail silently
        }
    }

    public getLocalStorageCache(): any {
        try {
            if (LocalStorageCacheManager.windowCacheExpiry < Date.now() || this.cacheEmptied()) {
                this.cache = JSON.parse(localStorage.getItem(LocalStorageCacheManager.cacheName) || '') || {};
                console.log('cache### %% getLocalStorageCache 1 refresh cache from localstorage=', this.cache);
                LocalStorageCacheManager.windowCacheExpiry = Date.now() + TEN_MINUTES_MS;
            } else {
                console.log('cache### getLocalStorageCache 1 use existing cache=', this.cache);
            }
        } catch (e) {
            this.cache = {};
        }

        let changed = this.cleanCacheList();
        if (changed) {
            console.log('cache### getLocalStorageCache 3 out of date entries to clear=', this.cache);
            this.saveLocalStorageCache(this.cache);
        }
        return this.cache;
    }

    private cacheEmptied = () => {
        return Object.keys(this.cache).length === 0;
    }

    // strip out anything older than the defined expiry period (initial planning: one day)
    private cleanCacheList = () => {
        const now = Date.now();
        let changed = false;
        for (const url in this.cache) {
            if (!this.cache[url] || !this.cache[url].expiryDate || (now - this.cache[url].expiryDate) >  LocalStorageCacheManager.expiryPeriodMilliseconds) {
                console.log('cache### getLocalStorageCache 2 clearing', this.cache[url]);
                delete this.cache[url];
                changed = true;
            } else {
                console.log('cache### getLocalStorageCache 2 cache valid for:', this.cache[url].expiryDate, url);
            }
        }
        return changed;
    }
}

const TALIS_CACHE_KEY = 'uqlTalisCourseList';
const CACHE_LENGTH_MS = window.location.hostname === 'localhost' ? TEN_MINUTES_MS : ONE_DAY_MS;

export const talisCacheManager = LocalStorageCacheManager.getInstance(TALIS_CACHE_KEY, CACHE_LENGTH_MS);

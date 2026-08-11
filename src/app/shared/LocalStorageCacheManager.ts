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

    private constructor() {} // no constructor on singleton

    public static getInstance(cacheName: string, expiryPeriodMilliseconds: number): LocalStorageCacheManager {
        if (!LocalStorageCacheManager.instance) {
            LocalStorageCacheManager.expiryPeriodMilliseconds = expiryPeriodMilliseconds;
            LocalStorageCacheManager.cacheName = cacheName;
            LocalStorageCacheManager.instance = new LocalStorageCacheManager();

            LocalStorageCacheManager.windowCacheExpiry = Date.now() +  TEN_MINUTES_MS; // we ensure we look at actual localstorage occasionally
        }
        return LocalStorageCacheManager.instance;
    }

    // write all the talis entries in one local storage entry
    public saveLocalStorageCache(cache: Cache) {
        try {
            this.cache = {
                ...this.cache,
                ...cache
            };
            localStorage.setItem(LocalStorageCacheManager.cacheName, JSON.stringify(this.cache));
        } catch (e) {
            console.log('[LPTC01] LocalStorageCacheManager: unable to write to local storage');
            // localStorage might be full or unavailable; fail silently
        }
    }

    public getLocalStorageCache(): any {
        try {
            if (LocalStorageCacheManager.windowCacheExpiry < Date.now() || this.cacheEmptied()) {
                this.cache = JSON.parse(localStorage.getItem(LocalStorageCacheManager.cacheName) || '') || {};
                LocalStorageCacheManager.windowCacheExpiry = Date.now() + TEN_MINUTES_MS;
            }
        } catch (e) {
            console.log('[LPTC02] LocalStorageCacheManager: local storage contents currently unavailable');
            this.cache = {};
        }

        let changesToSave = this.cleanCacheList();
        if (changesToSave) {
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
                delete this.cache[url];
                changed = true;
            }
        }
        return changed;
    }

    public  formattedCacheEntry = (courseList: { [key: string]: string; } | null): { courses: { [key: string]: string; } | null; expiryDate: number; } => {
        return {
            courses: courseList,
            expiryDate: Date.now()
        };
    }
}

const TALIS_CACHE_KEY = 'uqlTalisCourseList';
const CACHE_LENGTH_MS = window.location.hostname === 'localhost' ? TEN_MINUTES_MS : ONE_DAY_MS;

export const talisCacheManager = LocalStorageCacheManager.getInstance(TALIS_CACHE_KEY, CACHE_LENGTH_MS);

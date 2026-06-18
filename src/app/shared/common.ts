export const currentEnvironmentId = () => {
    let result;

    const paramName ='vid';
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has(paramName)) {
        result = urlParams.get(paramName);
    } else {
        const pathSegments = window.location.pathname.split('/');
        const institutionSegment = pathSegments.find(segment =>
            segment.includes('61UQ_INST:')
        );
        result = institutionSegment || null;
    }
    return result;
}

export function getCookieValue(name: string): string|undefined     {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; ++i) {
        const pair = cookies[i].trim().split('=');
        if (!!pair[0] && pair[0] === name) {
            return !!pair[1] ? pair[1] : /* istanbul ignore next */ undefined;
        }
    }
    return undefined;
}

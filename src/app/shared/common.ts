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
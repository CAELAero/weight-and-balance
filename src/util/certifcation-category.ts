/**
 * Representation of the JAR22 certification category. JAR22 only defines 2 categories:
 * Utility and Aerobatic. However, some older gliders, like the K13, have a different
 * even more restricted category to allow higher cockpit weights under limited conditions,
 * so the "special" category has been added for these. 
 */
export enum CertificationCategory {
    UTILITY = "utility",
    AEROBATIC = 'aerobatic',
    SPECIAL = "special"
}

export const reverseCertificationCategoryMap = new Map<string, CertificationCategory>(
    Object.values(CertificationCategory).map((value) => [`${value}`, value]),
);

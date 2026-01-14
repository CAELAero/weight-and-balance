
/** 
 * Hardcoded name munging map. Based on the "alternate" names that people would use when originally
 * registering aircraft with the GFA/CASA. Result was some interesting creating reinterpreation of
 * the type certificate name. This maps the oddballs back to the standardised name used in the TCDS.
 */
const typecertMap: Map<string, string> = new Map();

typecertMap.set("LIBELLE", "Standard Libelle");
typecertMap.set("LIBELLE 201B", "Standard Libelle 201 B");
typecertMap.set("H-301 B LIBELLE", "H 301 B");
typecertMap.set("304", "Glasflugel 304");
typecertMap.set("LIBELLE 205", "Club Libelle 205");
typecertMap.set("KESTREL", "T.59D Kestrel");
typecertMap.set("T59-D KESTREL", "T.59D Kestrel");
typecertMap.set("SZD-503 \"PUCHACZ\"", "SZD-50-3 Puchacz");
typecertMap.set("50-3 PUCHACZ", "SZD-50-3 Puchacz"); 
typecertMap.set("51-1 JUNIOR", "SZD-51-1 Junior");
typecertMap.set("SZD - 511 \"JUNIOR\"", "SZD-51-1 Junior");
typecertMap.set("SZD-56-1", "SZD-56-1 \"Diana\"");
typecertMap.set("55-1", "SZD-55-1");
typecertMap.set("9 BIS BOCIAN 1D", "SZD-9 bis 1D Bocian");
typecertMap.set("9 BIS BOCIAN 1E", "SZD-9 bis 1E Bocian");
typecertMap.set("42-2 JANTAR 2B", "SZD-42-2 Jantar 2B"); 
typecertMap.set("41-A JANTAR STAND", "SZD-41A Jantar Standard");
typecertMap.set("SZD 41A JANTAR ST", "SZD-41A Jantar Standard");
typecertMap.set("SZD41A JANTAR ST", "SZD-41A Jantar Standard");
typecertMap.set("48 JANTAR STD 2", "SZD-48 Jantar Standard 2");
typecertMap.set("SZD-48-1 JANTAR STD 2", "SZD-48-1 Jantar Standard 2");
typecertMap.set("SZD-48-1 JANTAR ST 2", "SZD-48-1 Jantar Standard 2");
typecertMap.set("48-1 JANTAR STD 2", "SZD-48 Jantar Standard 2");
typecertMap.set("48-3 JANTAR STD 3", "SZD-48-3 Jantar Standard 3");
typecertMap.set("JANTAR STD SZD-483", "SZD-48-3 Jantar Standard 3"); 
typecertMap.set("\"JANTAR ST-3\" SZD-483", "SZD-48-3 Jantar Standard 3");
typecertMap.set("30 PIRAT", "SZD-30 Pirat");
typecertMap.set("36A COBRA 15", "SZD-36A Cobra 15");
typecertMap.set("32A FOKA 5", "SZD-32A Foka 5");
typecertMap.set("DG-100 ELAN", "DG-100");
typecertMap.set("DG-303 ELAN ACRO", "DG-300 Elan Acro");
typecertMap.set("DG-505 ELAN ORION", "DG-500 Elan Orion");
typecertMap.set("101A", "Pegase 101A");
typecertMap.set("201B", "Marianne 201B");
typecertMap.set("NYMPH","ES 56/I Nymph"); 
typecertMap.set("NYMPH II","ES 56/II Nymph"); 
typecertMap.set("KINGFISHER II", "ES 57 MKII Kingfisher"); 
typecertMap.set("KINGFISHER III", "ES 57 MKIII Kingfisher"); 
typecertMap.set("E.S 57/III", "ES 57 MKIII Kingfisher");
typecertMap.set("KOOKABURRA II", "ES 52 MK II Kookaburra");
typecertMap.set("KOOKABURRA III", "ES 52 MK III Kookaburra"); 
typecertMap.set("KOOKABURRA IV", "ES 52 MK IV Kookaburra");
typecertMap.set("ES-52 MK-III", "ES 52 MK III Kookaburra");
typecertMap.set("ES-52 MK-IV", "ES 52 MK IV Kookaburra");
typecertMap.set("ES-52B MK-1", "ES 52B MK I Kookaburra");
typecertMap.set("ES-52B MK-II","ES 52B MK II Kookaburra"); 
typecertMap.set("ARROW","ES 59 Arrow");
typecertMap.set("ES-60","ES 60 Boomerang");
typecertMap.set("BOOMERANG I", "ES 60 Boomerang");
typecertMap.set("BOOMERANG II", "ES 60/1 Boomerang");
typecertMap.set("ES 60 MARK 2", "ES 60/2 Boomerang");
typecertMap.set("MDM-1 \"FOX\"", "MDM-1P \"FOX-P\"");
typecertMap.set("PW-5", "PW-5 \"Smyk\"");
typecertMap.set("PW-5 SMYK", "PW-5 \"Smyk\"");
typecertMap.set("MONERAI", "Monerai 'S'");
typecertMap.set("I.S.-28B2", "IS-28B2");
typecertMap.set("GLASFLUGEL 304C", "HPH Glasflugel 304 C");
typecertMap.set("GLASFLUGEL 304 S", "HPH Glasflugel 304 S");
typecertMap.set("B4-PC11", "Pilatus B4-PC11");
typecertMap.set("B4-PC11AF", "Pilatus B4-PC11AF");
typecertMap.set("CLUB ASTIR IIIB", "G 102 Club Astir IIIb");
typecertMap.set("TWIN II", "Grob G 103 Twin II");
typecertMap.set("TWIN II ACRO", "Grob G103A Twin II Acro");
typecertMap.set("VENTUS-B16.6", "Ventus b/16.6");
typecertMap.set("STD CIRRUS", "Standard Cirrus");

export function encodeTypeCertificateId(raw: string): string {
    // See if we have a variant type map that isn't the real one. 
    // if we do, replace the input ID with this real type cert and
    // then do all the usual stuff afterwards. 
    const alt_cert = typecertMap.get(raw);

    var ret_val = alt_cert ? alt_cert : raw;

    // since there are so many variations of type ID due to typos and 
    // poor data entry, compress everything down - remove everything other
    // than letters and numbers
    ret_val = ret_val.replaceAll(' ', '');
    ret_val = ret_val.replaceAll('-', '');
    ret_val = ret_val.replaceAll('_', '');
    ret_val = ret_val.replaceAll('.', '');
    ret_val = ret_val.replaceAll('/', '');
    ret_val = ret_val.replaceAll('"', '');
    ret_val = ret_val.replaceAll('\'', '');
    ret_val = ret_val.toUpperCase();

    return ret_val;
}
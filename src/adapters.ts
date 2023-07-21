import EN_ASV from "./bible-version-adapters/ASV_TO_APP_STANDARD"
import EN_ESV from "./bible-version-adapters/ESV_TO_APP_STANDARD"
import { BibleJSON_FROM_XML } from "./bible-version-adapters/XML_TO_STANDARD"
import NG_YORUBA from "./bible-version-adapters/YORUBA_TO_APP_STANDARD"

export const adapters:{[x:string]:any} = {"asv":EN_ASV, "bible_esv":EN_ESV, "yoruba-bible":NG_YORUBA, "bible_amp":BibleJSON_FROM_XML, "Bible_English_GNB":BibleJSON_FROM_XML, "Bible_English_MSG":BibleJSON_FROM_XML}

export const fetchAndCommitBibleFile = async(selectedVersion:version, setBooks:Function)=>{
  let s
  if(selectedVersion){
    let usesAdapter = adapters[selectedVersion.abbreviation]
    let isXmlBible = usesAdapter && adapters[selectedVersion.abbreviation] === BibleJSON_FROM_XML
    let baseUrl = (usesAdapter)?"./bible_versions/":"./bible_versions/bible-master/json/"
    fetch(`${baseUrl+selectedVersion.abbreviation}${isXmlBible?".xml":".json"}`).then((response)=>{
      return isXmlBible?response.text():response.json()
    }).then((data)=>{
      if(usesAdapter){
        let bible = adapters[selectedVersion.abbreviation](data)
        setBooks(bible)
        s = bible
      }else{
        setBooks(data)
        s = data
      }
    }).then(()=>{
        // this.setState({hasLoadedBible : true})
    })
  }
}
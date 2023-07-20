
(async ()=>{
    const { nextTick } = require("process")
    const {readFile, writeFile} = require("fs/promises")
    let fileContent = null
    let map = []

    for(let i = 30; i<=32; i++){
        fileContent = await readFile(`${i}.json`).then((content)=>{
            return JSON.parse(content)
        })
        let objArr = Object.values(fileContent)
        for(let j = 0; j<objArr.length; j++){
            // if(i === 1 && val["r"] && j === 0){
            //     let verse = val["v"].split(" ")
            //     let references = Object.values(val["r"]).map(ref=>ref.split(" "))
            //     let itemObj = {"verse":verse, "references":references}
            //     let mapContent = [itemObj]
            //     writeFile("combined_references_to_array.json", JSON.stringify(mapContent))
            // }
            // else{
                // Skip first item because it's a duplicate of the previous. id in the forEach loop is zero-based index
                if(j && objArr[j]["r"]){
                    let verse = objArr[j]["v"].split(" ")
                    let references = Object.values(objArr[j]["r"]).map(ref=>ref.split(" "))
                    let itemObj = {"verse":verse, "references":references}
                    let mapContent = await readFile("combined_references_to_array.json").then((content)=>JSON.parse(content))
                    mapContent.push(itemObj)
                    // let mapContent = [itemObj]
                    await writeFile("combined_references_to_array.json", JSON.stringify(mapContent)).then(()=>{console.log("========++++++=========", i, "----------------------------------", j)})
                }
            // }
        }
    }
})()

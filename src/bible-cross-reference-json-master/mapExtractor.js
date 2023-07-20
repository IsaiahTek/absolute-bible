(async ()=>{
    const {readFile, writeFile} = require("fs/promises")
    let fileContent = null
    let map = []
    for(let i = 2; i<=32; i++){
        fileContent = await readFile(`${i}.json`).then((content)=>{
            return JSON.parse(content)
        })
        let objArr = Object.values(fileContent)
        let first_ref = objArr[1]["v"].split(" ")
        let last_ref = objArr[objArr.length-1]["v"].split(" ")
        first_ref[1] = parseInt(first_ref[1])
        first_ref[2] = parseInt(first_ref[2])
        last_ref[1] = parseInt(last_ref[1])
        last_ref[2] = parseInt(last_ref[2])
        let itemObj = {"first_ref":first_ref, "last_ref":last_ref}
        let mapContent = await readFile("computed_reference.map.json").then((content)=>JSON.parse(content))
        mapContent.push(itemObj)
        writeFile("computed_reference.map.json", JSON.stringify(mapContent))
    }
})()
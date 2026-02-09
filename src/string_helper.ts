export const generateRandomKey = (length=12)=>{
    const randomNumber = ()=>{
        return (48 + Math.round(Math.random()*9))
    }
    const randomUpperCaseAlphabet = ()=>{
        return (65 + Math.round(Math.random()*25))
    }
    const randomLowerCaseAlphabet = ()=>{
        return (67 + Math.round(Math.random()*25))
    }
    const pointer = ()=>Math.round(Math.random()*1)
    let randomMatVal = ""
    for (let index = 0; index < length; index++) {
        randomMatVal += String.fromCharCode(
            pointer()?
                pointer()?
                    randomLowerCaseAlphabet():
                    randomUpperCaseAlphabet()
                :
                randomNumber())
    }
    return randomMatVal
}
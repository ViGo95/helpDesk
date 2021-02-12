const SECURITY_LEVEL = 9
const HASH_BITS = 18
const ABC = 'abcdefghijklmnopqrstuvwxyz123456789'
const CODEXES = {
    CODEX1: [
        '5d6f7+g!#b$3c4*k)h?0i¡-a6%123456789',
        '-1#2$3/4*5&6=7+8!9?0¿¡[)]%1(3456789',
        '1ab2cd3ef4gh5yj6kl7mn8op9q123456789',
        'qwertyuiopasdfghjklzxcvbnm123456789',
        'n5o6p-q+r9s1t2u3v4w/x*y7z8123456789',
        '1ab2cd3ef4gh5yj6kl7mn8op9q123456789',
        '-1#2$3/4*5&6=7+8!9?0¿¡[)]%1(3456789',
        'qwertyuiopasdfghjklzxcvbnm123456789',
        'n5o6p-q+r9s1t2u3v4w/x*y7z8123456789',
        '1q-5s$9c%7r&8g/3n#4u$6k%2z123456789',
    ],
    CODEX2: [
        '-1#2$3/4*5&6=7+8!9?0¿¡[)]%123456789',
        '5d6f7+g!#b$3c4*k)h?0i¡-a6%123456789',
        '1ab2cd3ef4gh5yj6kl7mn8op9q12#456789',
        'qwertyuiopasdfghjklzxcvbnm123456789',
        'n5o6p-q+r9s1t2u3v4w/x*y7z8123456789',
        '1q-5s$9c%7r&8g/3n#4u$6k%2z123456789',
        '-1#2$3/4*5&6=7+8!9?0¿¡[)]%123456789',
        '5d6f7+g!#b$3c4*k)h?0i¡-a6%123456789',
        '1ab2cd3ef4gh5yj6kl7mn8op9q12#456789',
        'qwertyuiopasdfghjklzxcvbnm123456789',
    ],
    CODEX3: [
        '-1#2$3/4*5&6=7+8!9?0¿¡[)]%123456789',
        '1ab2cd3ef4gh5yj6kl7mn8op9q123456789',
        '5d6f7+g!#b(3c4*k)h?0i¡-a6%123$56789',
        'qwertyuiopasdfghjklzxcvbnm123456789',
        'n5o6p-q+r9s1t2u3v4w/x*y7z8123456789',
        '5d6f7+g!#b(3c4*k)h?0i¡-a6%123$56789',
        '1q-5s$9c%7r&8g/3n#4u$6k%2z123456789',
        'qwertyuiopasdfghjklzxcvbnm123456789',
        'n5o6p-q+r9s1t2u3v4w/x*y7z8123456789',
        '1q-5s$9c%7r&8g/3n#4u$6k%2z123456789',
    ],
    CODEX4: [
        '-1#2$3/4*5&6=7+8!9?0¿¡[)]%123456789',
        '1ab2cd3ef4gh5yj6kl7mn8op9q123456789',
        'qwertyuiopasdfghjklzxcvbnm1234%6789',
        '5d6f7+g!#b$3c4*k)h?0i¡-a6%123456789',
        'n5o6p-q+r9s1t2u3v4w/x*y7z8123456789',
        '1ab2cd3ef4gh5yj6kl7mn8op9q123456789',
        'qwertyuiopasdfghjklzxcvbnm1234%6789',
        '5d6f7+g!#b$3c4*k)h?0i¡-a6%123456789',
        'n5o6p-q+r9s1t2u3v4w/x*y7z8123456789',
        '1q-5s$9c%7r&8g/3n#4u$6k%2z123456789',
    ],
    CODEX5: [
        '-1#2$3/4*5&6=7+8!9?0¿¡[)]%123456789',
        '1ab2cd3ef4gh5yj6kl7mn8op9q123456789',
        'qwertyuiopasdfghjklzxcvbnm12345&789',
        'n5o6p-q+r9s1t2u3v4w/x*y7z8123456789',
        '5d6f7+g!#b$3c4*k)h?0i¡-a6%123456789',
        '-1#2$3/4*5&6=7+8!9?0¿¡[)]%123456789',
        '1ab2cd3ef4gh5yj6kl7mn8op9q123456789',
        'qwertyuiopasdfghjklzxcvbnm12345&789',
        'n5o6p-q+r9s1t2u3v4w/x*y7z8123456789',
        '1q-5s$9c%7r&8g/3n#4u$6k%2z123456789',
    ],
    CODEX6: [
        '-1#2$3/4*5&6=7+8!9?0¿¡[)]%123456789',
        '1ab2cd3ef4gh5yj6kl7mn8op9q123456789',
        'qwertyuiopasdfghjklzxcvbnm123456/89',
        'n5o6p-q+r9s1t2u3v4w/x*y7z8123456789',
        '1ab2cd3ef4gh5yj6kl7mn8op9q123456789',
        'qwertyuiopasdfghjklzxcvbnm123456/89',
        '1q-5s$9c%7r&8g/3n#4u$6k%2z123456789',
        'n5o6p-q+r9s1t2u3v4w/x*y7z8123456789',
        '1q-5s$9c%7r&8g/3n#4u$6k%2z123456789',
        '5d6f7+g!#b$3c4*k)h?0i¡-a6%123456789',
    ],
    CODEX7: [
        '1ab2cd3ef4gh5yj6kl7mn8op9q123456789',
        'qwertyuiopasdfghjklzxcvbnm123456789',
        '-1#2$3/4*5&6=7+8!9?0¿¡[)]%1234567(9',
        'n5o6p-q+r9s1t2u3v4w/x*y7z8123456789',
        '1q-5s$9c%7r&8g/3n#4u$6k%2z123456789',
        '-1#2$3/4*5&6=7+8!9?0¿¡[)]%1234567(9',
        'n5o6p-q+r9s1t2u3v4w/x*y7z8123456789',
        '5d6f7+g!#b$3c4*k)h?0i¡-a6%123456789',
        '1q-5s$9c%7r&8g/3n#4u$6k%2z123456789',
        '5d6f7+g!#b$3c4*k)h?0i¡-a6%123456789',
    ],
    CODEX8: [
        '1ab2cd3ef4gh5yj6kl7mn8op9q123456789',
        '-1#2$3/4*5&6=7+8!9?0¿¡[)]%123456789',
        'qwertyuiopasdfghjklzxcvbnm12345678)',
        'n5o6p-q+r9s1t2u3v4w/x*y7z8123456789',
        '1q-5s$9c%7r&8g/3n#4u$6k%2z123456789',
        '5d6f7+g!#b$3c4*k)h?0i¡-a6%123456789',
        'n5o6p-q+r9s1t2u3v4w/x*y7z8123456789',
        'qwertyuiopasdfghjklzxcvbnm12345678)',
        '1q-5s$9c%7r&8g/3n#4u$6k%2z123456789',
        '5d6f7+g!#b$3c4*k)h?0i¡-a6%123456789',
    ],
    CODEX9: [
        '1ab2cd3ef4gh5yj6kl7mn8op9q123456789',
        '-1#2$3/4*5&6=7+8!9?0¿¡[)]%123456789',
        'n5o6p-q+r9s1t2u3v4w/x*y7z8123456789',
        'qwertyuiopasdfghjklzxcvbnm123456789',
        '1q-5s$9c%7r&8g/3n#4u$6k%2z123456789',
        '5d6f7+g!#b$3c4*k)h?0i¡-a6%123456789',
        '-1#2$3/4*5&6=7+8!9?0¿¡[)]%123456789',
        'n5o6p-q+r9s1t2u3v4w/x*y7z8123456789',
        'qwertyuiopasdfghjklzxcvbnm123456789',
        '1q-5s$9c%7r&8g/3n#4u$6k%2z123456789',
    ],
    CODEX10: [
        '1ab2cd3ef4gh5yj6kl7mn8op9q123456789',
        '-1#2$3/4*5&6=7+8!9?0¿¡[)]%123456789',
        'n5o6p-q+r9s1t2u3v4w/x*y7z8123456789',
        '1q-5s$9c%7r&8g/3n#4u$6k%2z123456789',
        'qwertyuiopasdfghjklzxcvbnm123456789',
        '5d6f7+g!#b$3c4*k)h?0i¡-a6%123456789',
        'n5o6p-q+r9s1t2u3v4w/x*y7z8123456789',
        '1q-5s$9c%7r&8g/3n#4u$6k%2z123456789',
        'qwertyuiopasdfghjklzxcvbnm123456789',
        '5d6f7+g!#b$3c4*k)h?0i¡-a6%123456789',
    ]
}

//  -----------------------------      ENCRIPTAR PALABRAS      -----------------------------

function encrypt (pass) {

    const keyedPass = assingKey(pass)
    
    const alteredPass = alterPass(pass, keyedPass)
    
    const encryptedPass = encryptingPass(alteredPass)

    return encryptedPass
}

function assingKey (pass) {
    const key = pass.length
    const lastLetter = key - 1
    let keyPass = ''

    if (key < 3) {
        keyPass += pass.chatAt(0) + key + pass.charAt(1)

    } else {
        keyPass += pass.substr(0, 2) + key + pass.substr(2, lastLetter)
    }
    return keyPass
}

function alterPass (pass, keyPass) {
    var alteredPass = ''
    const passBits = pass.length

    switch (passBits) {
        case 2: 
        codex = CODEXES.CODEX1
        alteredPass = keyPass + pass + pass + pass + pass + pass + pass + pass + pass.charAt(0)
        break

        case 3:  
        codex = CODEXES.CODEX2
        alteredPass = keyPass + pass + pass + pass + pass + pass.substr(0, 2)
        break

        case 4:  
        codex = CODEXES.CODEX3
        alteredPass = keyPass + pass + pass + pass + pass.charAt(0)
        break

        case 5:  
        codex = CODEXES.CODEX4
        alteredPass = keyPass + pass + pass + pass.substr(0, 2)
        break

        case 6:  
        codex = CODEXES.CODEX5
        alteredPass = keyPass + pass + pass.substr(0, 5)
        break

        case 7:  
        codex = CODEXES.CODEX6
        alteredPass = keyPass + pass + pass.substr(0, 3)
        break

        case 8:  
        codex = CODEXES.CODEX7
        alteredPass = keyPass + pass + pass.charAt(0)
        break

        case 9:  
        codex = CODEXES.CODEX8
        alteredPass = keyPass + pass.substr(0, 8)
        break

        case 10:  
        codex = CODEXES.CODEX9
        alteredPass = keyPass + pass.substr(0, 7)
        break

        case 11:  
        codex = CODEXES.CODEX10
        alteredPass = keyPass + pass.substr(0, 6)
        break
    }
    return alteredPass
}

function encryptingPass(pass) {
    const passBits = pass.length
    let codexPhrase = 0
    let encryptedPass = ''
    
    for (let i = 0; i < passBits; i++) {
        let abcPosition = 0
        
        while (pass.charAt(i) != ABC.charAt(abcPosition)) {
            abcPosition++   
        }
        
        encryptedPass += codex[codexPhrase].charAt(abcPosition)

        codexPhrase++

        if (codexPhrase > SECURITY_LEVEL) {
            codexPhrase = 1
        }
    }
    
    for (let i = 0; i < passBits; i++) {
        
    }
    return encryptedPass
}

//  ---------------------------      DESENCRIPTAR PALABRAS      ----------------------------

function decrypt (phrase) {  
    const decryptedPass = decryptingPass(phrase)
    
    return decryptedPass
}

function decryptingKey (phrase) {   
    let encryptedPass = ''
    let key = phrase.charAt(2)
    
    if (phrase.charAt(1) == '(') {
        key = '"'
    } 

    switch(key) {
        case '"':
            codex = CODEXES.CODEX1
            encryptedPass = phrase.substr(0, 3)
        break

        case '#':
            codex = CODEXES.CODEX2
            encryptedPass = phrase.substr(0, 4)
        break

        case '$':
            codex = CODEXES.CODEX3
            encryptedPass = phrase.substr(0, 5)
        break

        case '%':
            codex = CODEXES.CODEX4
            encryptedPass = phrase.substr(0, 6)
        break

        case '&':
            codex = CODEXES.CODEX5
            encryptedPass = phrase.substr(0, 7)
        break

        case '/':
            codex = CODEXES.CODEX6
            encryptedPass = phrase.substr(0, 8)
        break

        case '(':
            codex = CODEXES.CODEX7
            encryptedPass = phrase.substr(0, 9)
        break

        case ')':
            codex = CODEXES.CODEX8
            encryptedPass = phrase.substr(0, 10)
        break
    }
    return encryptedPass
}

function decryptingPass(phrase) {
    var codexPhrase = 0
    let decryptedPass = ''
    const encryptedPass = decryptingKey(phrase)
    
    for (let i = 0; i < encryptedPass.length; i++) {
        let abcPosition = 0
        
        while (encryptedPass.charAt(i) != codex[codexPhrase].charAt(abcPosition)) {
            abcPosition++   
        }
        
        decryptedPass += ABC.charAt(abcPosition)
        
        codexPhrase++
        
        if (codexPhrase > SECURITY_LEVEL) {
            codexPhrase = 1
        }
    }
    const pass = normalizePass(decryptedPass)

    return pass
}

function normalizePass (decryptedPass) {   
    let encryptedPass = ''
    let key = decryptedPass.charAt(2)
    
    if (decryptedPass.charAt(1) == '(') {
        key = '"'
    } 

    switch(key) {
        case '2':
            codex = CODEXES.CODEX1
            encryptedPass = decryptedPass.charAt(0) + decryptedPass.charAt(2)
        break

        case '3':
            codex = CODEXES.CODEX2
            encryptedPass = decryptedPass.substr(0, 2) + decryptedPass.charAt(3)
        break

        case '4':
            codex = CODEXES.CODEX3
            encryptedPass = decryptedPass.substr(0, 2) + decryptedPass.substr(3, 2)
        break

        case '5':
            codex = CODEXES.CODEX4
            encryptedPass = decryptedPass.substr(0, 2) + decryptedPass.substr(3, 3)
        break

        case '6':
            codex = CODEXES.CODEX5
            encryptedPass = decryptedPass.substr(0, 2) + decryptedPass.substr(3, 4)
        break

        case '7':
            codex = CODEXES.CODEX6
            encryptedPass = decryptedPass.substr(0, 2) + decryptedPass.substr(3, 5)
        break

        case '8':
            codex = CODEXES.CODEX7
            encryptedPass = decryptedPass.substr(0, 2) + decryptedPass.substr(3, 6)
        break

        case '9':
            codex = CODEXES.CODEX8
            encryptedPass = decryptedPass.substr(0, 2) + decryptedPass.substr(3, 7)
        break
    }
    return encryptedPass
}

module.exports = {
    encrypt,
    decrypt,
}
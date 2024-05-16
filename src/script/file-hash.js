import CryptoJS from 'crypto-js'

export default {
    fileHeadHash,
    fileEntiretyHash,
    fileSegmentHash
}

async function fileEntiretyHash(file){
    return await new FileHashCalculator(file).hashAsync()
}

async function fileHeadHash(file, headSize){
    return  await new FileHashCalculator(file).setEndPosition(headSize).hashAsync()
}

async function fileSegmentHash(file, start, end){
    return  await new FileHashCalculator(file).setStartPosition(start).setEndPosition(end).hashAsync()
}

class FileHashCalculator {
    #calculator
    #file
    #step
    #start
    #end

    constructor(file, algo = 'SHA256') {
        this.#file = file
        this.#start = 0
        this.#end = file.size
        this.#step = 16 * 1024 * 1024 // Size of each update
        this.#calculator = CryptoJS.algo[algo].create()
    }

    setStartPosition(position) {
        this.#start = position
        return this
    }

    setEndPosition(position) {
        this.#end = position
        return this
    }

    async hashAsync() {
        return new Promise(async (resolve) => {
            await this.#sliceUpdateAsync()
            const hash = this.#calculator.finalize()
            resolve(hash.toString(CryptoJS.enc.Hex))
        })
    }

    async #sliceUpdateAsync() {
        for (let start = this.#start, end = start + this.#step;
             start < this.#end;
             start = end, end += this.#step) {
            if (end > this.#end) {
                end = this.#end
            }
            const seg = this.#file.slice(start, end)
            await this.#updateAsync(seg)
        }
    }

    async #updateAsync(segment) {
        console.log('seg')
        let buffer = await segment.arrayBuffer()
        let words = CryptoJS.lib.WordArray.create(buffer)
        this.#calculator.update(words)
    }
}

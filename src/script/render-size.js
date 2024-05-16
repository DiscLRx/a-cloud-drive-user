export function renderSize(srcsize) {
    if (srcsize === 0) {
        return '0 B'
    }
    let unitArr = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
    let index = Math.floor(Math.log(srcsize) / Math.log(1024))
    let size = srcsize / Math.pow(1024, index)
    size = size.toFixed(2)
    return `${size} ${unitArr[index]}`
}
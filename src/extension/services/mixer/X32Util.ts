export function dbToFloat(d: number): number {
    let f: number
    if (d < -60) {
        f = (d + 90) / 480
    } else if (d < -30) {
        f = (d + 70) / 160
    } else if (d < -10) {
        f = (d + 50) / 80
    } else if (d <= 10) {
        f = (d + 30) / 40
    } else {
        f = 1
    }
    // Optionally round “f” to a X32 known value
    return f // Math.round((f * 1023.5) / 1023.0)
}

import { uid } from "../utils";

describe('uid function', () => {
    const charset = '0123456789abcdefghiklmnopqrstuvwxyz';

    test('should return a string of length 8', () => {
        const result = uid();
        expect(result).toHaveLength(8);
    });

    test('should only contain valid characters', () => {
        const result = uid();
        // Ensure every character in the result is in the charset
        for (let char of result) {
            expect(charset.includes(char)).toBe(true);
        }
    });

    test('should generate unique values on subsequent calls', () => {
        const results = new Set(Array.from({ length: 100 }, uid));
        // If all are unique, the size of the set should be 100
        expect(results.size).toBe(100);
    });
});

export function uid() {
	const charset = '0123456789abcdefghiklmnopqrstuvwxyz';

	return (Array(8).fill().map(() => 
		charset[~~(Math.random() * charset.length)]
	).join(''));
}
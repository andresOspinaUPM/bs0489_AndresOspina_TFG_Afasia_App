export const formatTime = (seconds: number): string => {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
	};

  export const formatDate = (date: string): string =>{
		return new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
	}

export const capitalize = (str: string): string => {
  if(!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
import Table from 'react-bootstrap/Table';
import style from './Records.module.css';

function Records() {
	return (
		<div className={style['container']}>
			<div className={style['table-container']}>
				<h1>Registros pruebas</h1>
				<Table striped className={style['records-table']}>
					<thead>
						<tr>
							<th>Palabra</th>
							<th>Tiempo Respuesta</th>
							<th>Fecha</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>Objeto 1</td>
							<td>13:20</td>
							<td>12/05/2025</td>
						</tr>
						<tr>
							<td>Objeto 2</td>
							<td>17:02</td>
							<td>12/05/2025</td>
						</tr>
						<tr>
							<td>Objeto 3</td>
							<td>10:33</td>
							<td>12/05/2025</td>
						</tr>
						<tr>
							<td>Objeto 4</td>
							<td>15:120</td>
							<td>13/05/2025</td>
						</tr>
						<tr>
							<td>Objeto 5</td>
							<td>12:03</td>
							<td>13/05/2025</td>
						</tr>
						<tr>
							<td>Objeto 6</td>
							<td>18:03</td>
							<td>13/05/2025</td>
						</tr>
					</tbody>
				</Table>
			</div>
		</div>
	);
}

export default Records;

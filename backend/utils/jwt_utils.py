import jwt
from datetime import datetime, timedelta
from config import jwt_config

def create_access_token(data:dict) -> str:
    data_to_encode = data.copy()
    expire_token_time = datetime.utcnow() + timedelta(minutes=jwt_config.ACCESS_TOKEN_EXPIRE_MINUTES)
    data_to_encode.update({'exp': expire_token_time})
    encoded_jwt_token = jwt.encode(data_to_encode, jwt_config.SECRET_KEY, algorithm=jwt_config.ALGORITHM)
    return encoded_jwt_token

def decode_access_token(token:str) -> dict:
    try:
        decoded_token = jwt.decode(token, jwt_config.SECRET_KEY, algorithms=[jwt_config.ALGORITHM])
        return decoded_token
    
    except jwt.ExpiredSignatureError:
        raise Exception('El Token ha expirado')

    except jwt.InvalidTokenError:
        raise Exception('El Token es inválido')
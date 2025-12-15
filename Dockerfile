FROM python:3.11

WORKDIR /code

COPY ./requirements.txt /code/requirements.txt

RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

COPY . /code

# Create data directory and set permissions for writing
RUN mkdir -p /code/data && chmod 777 /code/data

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]

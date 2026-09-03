# Stage 1: Build with Maven
FROM maven:3.9-eclipse-temurin-17 AS builder

WORKDIR /build

COPY pom.xml .

RUN mvn dependency:go-offline -B

COPY src src

RUN mvn clean package -DskipTests -B


# Stage 2: Runtime
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

COPY --from=builder /build/target/eureka-server-*.jar eureka-server.jar

EXPOSE 8761

CMD ["sh", "-c", "java -Dserver.port=${PORT:-8761} -jar eureka-server.jar"]
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    cerebras_api_key: str = ""
    tinyfish_api_url: str = "https://agent.tinyfish.ai/"
    github_token: str = ""

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()

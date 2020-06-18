import random
from locust import HttpUser, task, between

class OctopipeGenericClusterTest(HttpUser):
    wait_time = between(5, 9)

    @task
    def deploy(self):
        pass
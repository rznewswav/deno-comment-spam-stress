from locust import HttpUser, between
from random import choice
from faker import Faker
fake = Faker()

userIds = [
    {
        "uuid": "8edd32e2-5702-412e-80f5-335d96ff5ccb"
    },
    {
        "uuid": "979b086d-6709-4048-b9a5-9973fdb87624"
    },
    {
        "uuid": "bb0b59ae-d20d-4721-9922-c1fc3ee8fad7"
    },
    {
        "uuid": "dd075ad5-4a15-4e1d-ba3a-c0dd958a597b"
    },
    {
        "uuid": "17a76a5e-84bc-40e4-b164-20f0f10e68b5"
    },
    {
        "uuid": "8f065c50-1801-4180-91ec-d2b0584e120e"
    },
    {
        "uuid": "a22b9632-3474-420f-acce-b0a9837cd842"
    },
    {
        "uuid": "aa0a5ea4-9cb5-4b8a-9f1f-9c42afd2f9b6"
    },
    {
        "uuid": "310eb068-d9c9-4de9-b712-6ccc75b96358"
    },
    {
        "uuid": "17112ea2-b64c-495b-96f1-54d6f3f3feca"
    },
    {
        "uuid": "23e85807-1735-4181-a127-043e889fd2f1"
    },
    {
        "uuid": "e1c1208b-542c-41d8-b9ae-f5003a7ad4ce"
    },
    {
        "uuid": "d19ab902-1281-4d54-a5cc-2ccb2cd6e50f"
    },
    {
        "uuid": "ebfac4dd-52d0-4717-9472-de22b1eaac3e"
    },
    {
        "uuid": "9d0b679d-3fe0-4ccc-8814-a7278ad69d57"
    },
    {
        "uuid": "d8d7e778-5972-4390-96b0-45a701b81fb4"
    },
    {
        "uuid": "6d04d2ad-4407-4a31-b9a2-cfa533dc6778"
    },
    {
        "uuid": "8a6bd666-7963-48cf-b154-5f0f9233a539"
    },
    {
        "uuid": "2a3b4502-23ec-438e-9cec-0e73e382556d"
    },
    {
        "uuid": "aa0b688d-d248-47d2-98df-067bcd306dc8"
    },
    {
        "uuid": "896fdbef-c867-4bad-8c81-4bca9d8b090d"
    },
    {
        "uuid": "f3ff6c30-ee79-4d82-b38a-13d8e179c128"
    },
    {
        "uuid": "96478aa7-29fc-44f7-8d9e-9afa98d8f022"
    },
    {
        "uuid": "ef8c5aba-5476-499c-8088-0ed64b252220"
    },
    {
        "uuid": "83801fbe-5675-4ecd-93f6-6a46ecdfa6cc"
    },
    {
        "uuid": "2e47beaf-89b4-4cb2-83d2-770334adf48f"
    },
    {
        "uuid": "dec1e4fb-66ca-4ba8-9070-8f017f37dc2d"
    },
    {
        "uuid": "a868c64b-14b5-4c36-9b27-84bc74e4fc9c"
    },
    {
        "uuid": "bd32c281-9fc8-4cc2-9413-8c95e2f974c4"
    },
    {
        "uuid": "8649a961-e5c9-4a68-aa20-64a7710813cb"
    },
    {
        "uuid": "723fda9c-a74a-4b45-af80-cd7444aad052"
    },
    {
        "uuid": "dddb705e-e1dd-4587-a8a8-b1904b6734ff"
    },
    {
        "uuid": "5539004e-51e7-4696-83cc-d3c3f01e94d3"
    },
    {
        "uuid": "8bf118c5-91db-474d-94aa-5c1408b2bf26"
    },
    {
        "uuid": "a16c584b-74e9-42ac-b90a-291c695139ad"
    },
    {
        "uuid": "60e66a31-a725-4600-8ec9-3483dd20f5cd"
    },
    {
        "uuid": "75e9c845-c914-4eb2-a041-ae75a68f2968"
    },
    {
        "uuid": "006cd086-9836-48b1-af0e-99118ce963f1"
    },
    {
        "uuid": "fca2e9c4-287b-4b88-86c9-0a74b4f81239"
    },
    {
        "uuid": "8d67e597-34ab-492a-86e2-b74488312000"
    },
    {
        "uuid": "fece3e1f-d38b-47da-9b8b-9d47c69ef123"
    },
    {
        "uuid": "47e9f7a2-35ac-478d-aa33-a027f336b7f5"
    },
    {
        "uuid": "4a4c14dd-7028-414e-be8d-5c6c4d59b61a"
    },
    {
        "uuid": "827163bf-7cc4-41d9-8c5d-05f51059ceaf"
    },
    {
        "uuid": "8c1bf663-777e-4de9-a0ec-2af04a3ce060"
    },
    {
        "uuid": "bbca7e05-43b3-4f57-abf1-5286e5f99c26"
    },
    {
        "uuid": "f28cb646-d50f-4527-9cad-44e60e582cc7"
    },
    {
        "uuid": "05c2db26-8e79-40d3-b7bc-7df329a4428e"
    },
    {
        "uuid": "49c00b4d-a314-49d8-a009-fb3a607c63cc"
    },
    {
        "uuid": "d8ee5e95-07ad-4364-90a5-0943c0aeee35"
    }
]


def create_spam_comments(taskset) -> None:
    requestUrl = taskset.url
    if taskset.user is None:
        randomUserId = choice(userIds)
        taskset.user = randomUserId["uuid"]

    taskset.client.headers = {
        "user": taskset.user,
    }
    res = taskset.client.post(
        requestUrl,
        json={"comment": "spammy hehe"}
    )
    jsonResponse = res.json()
    return

def create_normal_comments(taskset) -> None:
    requestUrl = taskset.url
    if taskset.user is None:
        randomUserId = choice(userIds)
        taskset.user = randomUserId["uuid"]

    taskset.client.headers = {
        "user": taskset.user,
    }
    comment = fake.text().replace("\n", " ").replace("\"", "''")
    res = taskset.client.post(
        requestUrl,
        json={"comment": comment}
    )
    jsonResponse = res.json()
    return


class SpammyUser(HttpUser):
    user = None
    url = '/api/v1/comments'
    tasks = [
        create_spam_comments
    ]
    wait_time = between(10, 30)


class NormalUser(HttpUser):
    user = None
    url = '/api/v1/comments'
    tasks = [
        create_normal_comments
    ]
    wait_time = between(10, 30)

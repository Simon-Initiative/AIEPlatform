num_users = 100
import time
import random
from routes.user_interaction import *
users = []
users_status = {}
import threading
from credentials import *
import numpy as np


# {"studyName":"sim","description":"test2 description","mooclets":[{"id":1,"parent":0,"droppable":true,"isOpen":true,"text":"mooclet1","name":"mooclet1","policy":"ThompsonSamplingContextual","parameters":{"batch_size":1,"variance_a":1,"variance_b":5,"uniform_threshold":1,"precision_draw":1,"updatedPerMinute":0,"include_intercept":true,"coef_cov":[[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]],"coef_mean":[0,0,0,0],"regressionFormulaItems":[[{"name":"test","index":0}],[{"name":"version1","content":"v1"}],[{"name":"test","index":0},{"name":"version1","content":"v1"}]]},"weight":100}],"variables":[{"name":"test","index":0}],"versions":[{"name":"version1","content":"v1"},{"name":"version2","content":"v2"}]}


def random_sim():
    for user in range(1, num_users + 1):
        users.append(f'sim_user_{user}')
        name = f'sim_user_{user}'
        users_status[name] = "no_arm"

    def one_user(user):
        while True:
            time.sleep(1) # every 2 seconds I pick a random user, assign arm or send reward.
            number = random.random()
            if number < 0.5: 
                pass
            elif number >= 0.5 and number < 0.95:
                if users_status[user] == "no_arm":
                    if random.random() < 0.9:
                        assign_treatment(deployment, study, user)
                        users_status[user] = "arm_assigned"
                    else:
                        value = random.choice([0, 1])
                        get_reward(deployment, study, user, value)
                        users_status[user] = "no_arm"
                else:
                    if random.random() < 0.3:
                        assign_treatment(deployment, study, user)
                        users_status[user] = "arm_assigned"
                    else:
                        value = random.choice([0, 1])
                        get_reward(deployment, study, user, value)
                        users_status[user] = "no_arm"
            else:
                # contextual
                for variable in variables:
                    new_value = random.choice([0, 1])
                    print(give_variable_value(deployment, study, variable, user, new_value))




    Interaction.delete_many({})
    Lock.delete_many({})
    RewardLog.delete_many({})
    TreatmentLog.delete_many({})
    VariableValue.delete_many({})
    for user in users:
        t = threading.Thread(target=one_user, args=(user,))
        t.start()


def two_version_ts(num_users = 100):
    # The goal is to verify that Thompson sampling is better than uniform sampling, in terms of finding significant results, and average rewards (0 or 1 in this simple simulation case).
    num_users = 100
    # first, we define a N * 2 user matrix. The first column is the probablity that user will give reward 1 if they receive version 1, and the second column is the probablity that user will give reward 1 if they receive version 2.
    def generate_user_matrix(num_users):
        user_matrix = np.random.rand(num_users, 2)
        return user_matrix
    user_matrix = generate_user_matrix(num_users)
    # next, we need to have a dict that records the last version the user has received.
    users_status = {}
    # next, define all usernames
    users = []
    for user in range(1, num_users + 1):
        users.append(f'sim_user_{user}')
        name = f'sim_user_{user}'
        users_status[name] = "no_arm"

    # simulate user behaviour.

    def one_user(user, i):
        while True:
            time.sleep(1) # every 2 seconds I pick a random user, assign arm or send reward.
            number = random.random()
            if number < 0.5: 
                pass
            elif number >= 0.5 and number < 0.95:
                if users_status[user] == "no_arm":
                    if random.random() < 0.9:
                        version_to_show = assign_treatment(deployment, study, user)['name']
                        users_status[user] = version_to_show
                    else:
                        value = None
                        reward_prob = user_matrix[i][0] if users_status[user] == "version1" else user_matrix[i][1]
                        if random.random() < reward_prob:
                            value = 1
                        else:
                            value = 0
                        get_reward(deployment, study, user, value)
                else:
                    if random.random() < 0.3:
                        version_to_show = assign_treatment(deployment, study, user)['name']
                        users_status[user] = version_to_show
                    else:
                        value = None
                        reward_prob = user_matrix[i][0] if users_status[user] == "version1" else user_matrix[i][1]
                        if random.random() < reward_prob:
                            value = 1
                        else:
                            value = 0
                        get_reward(deployment, study, user, value)
                        users_status[user] = "no_arm"
            else:
                # contextual
                for variable in variables:
                    new_value = random.choice([0, 1])
                    print(give_variable_value(deployment, study, variable, user, new_value))


    Interaction.delete_many({})
    Lock.delete_many({})
    RewardLog.delete_many({})
    TreatmentLog.delete_many({})
    VariableValue.delete_many({})
    for i in range(0, len(users)):
        user = users[i]
        t = threading.Thread(target=one_user, args=(user, i))
        t.start()


# deployment = 'Sim'
# study = 'two_version_ts'
# variables = ['isHappyOrNot']
# two_version_ts(num_users = 100)




def two_var_strong_predictor(num_users = 100):
    # The goal is to verify that Thompson sampling is better than uniform sampling, in terms of finding significant results, and average rewards (0 or 1 in this simple simulation case).
    num_users = 100
    # first, we define a N * 2 user matrix. The first column is the probablity that user will give reward 1 if they receive version 1, and the second column is the probablity that user will give reward 1 if they receive version 2.
    def generate_user_matrix(num_users):
        user_matrix = np.random.rand(num_users, 2)
        return user_matrix
    user_matrix = generate_user_matrix(num_users)
    # next, we need to have a dict that records the last version the user has received.
    users_status = {}
    # next, define all usernames
    users = []
    for user in range(1, num_users + 1):
        users.append(f'sim_user_{user}')
        name = f'sim_user_{user}'
        users_status[name] = "no_arm"

    # simulate user behaviour.

    def one_user(user, i):
        predictor = None
        for variable in variables:
            predictor = random.choice([0, 1])
            give_variable_value(deployment, study, variable, user, predictor)
        while True:
            time.sleep(1) # every 2 seconds I pick a random user, assign arm or send reward.
            number = random.random()
            if number < 0.5: 
                pass
            else:
                if users_status[user] == "no_arm":
                    if random.random() < 0.9:
                        version_to_show = assign_treatment(deployment, study, user)['name']
                        users_status[user] = version_to_show
                    else:
                        value = None
                        reward_prob = user_matrix[i][0] if users_status[user] == "version1" else user_matrix[i][1]

                        if users_status[user] == "version1" and predictor == 1:
                            reward_prob += 0.1
                        elif users_status[user] == "version2" and predictor == 1:
                            reward_prob -= 0.1
                        if random.random() < reward_prob:
                            value = 1
                        else:
                            value = 0
                        get_reward(deployment, study, user, value)
                else:
                    if random.random() < 0.3:
                        version_to_show = assign_treatment(deployment, study, user)['name']
                        users_status[user] = version_to_show
                    else:
                        value = None
                        reward_prob = user_matrix[i][0] if users_status[user] == "version1" else user_matrix[i][1]
                        if users_status[user] == "version1" and predictor == 1:
                            reward_prob += 0.02
                        elif users_status[user] == "version2" and predictor == 1:
                            reward_prob -= 0.02

                        if users_status[user] == "version1" and predictor == 0:
                            reward_prob -= 0.02
                        elif users_status[user] == "version2" and predictor == 0:
                            reward_prob += 0.02

                        if random.random() < reward_prob:
                            value = 1
                        else:
                            value = 0
                        get_reward(deployment, study, user, value)
                        users_status[user] = "no_arm"


    Interaction.delete_many({})
    Lock.delete_many({})
    RewardLog.delete_many({})
    TreatmentLog.delete_many({})
    VariableValue.delete_many({})
    for i in range(0, len(users)):
        user = users[i]
        t = threading.Thread(target=one_user, args=(user, i))
        t.start()


deployment = 'Sim'
study = '2_var_strong_predictor'
variables = ['male']

two_var_strong_predictor(num_users = 100)
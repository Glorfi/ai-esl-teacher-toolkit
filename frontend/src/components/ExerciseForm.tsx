import {
  RadioGroup,
  HStack,
  Radio,
  Card,
  CardBody,
  CardFooter,
  Button,
  Text,
  Input,
  VStack,
  Select,
  Tooltip,
  Textarea,
  useToast,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useCompleteChatMutation } from '../store/gpt-api/gpt.api';
import { useGeneratePrompt } from '../utils/generatePrompt';
import { LEARNER_AGE, LEARNER_LEVEL } from '../constants/prompt';
import { useDispatch } from 'react-redux';
import { addValues } from '../store/exercise-form/exercise-form-router';
import { ISentence } from '../interfaces/sentence-with-input';
import { useCreateExerciseMutation } from '../store/main-api/mutations/createExercise';
import { customError } from '../interfaces/customError';
import { LSHandler } from '../utils/handleLocalStorage';
import { UserContext } from '../contexts/UserContext';
import { addExercise } from '../store/exerciseList/exercise-list-router';
import { useGenerateExerciseMutation } from '../store/main-api/mutations/generateExercise';
import { useNavigate } from 'react-router-dom';
import { APP_PATHS } from '../constants/AppPaths';

interface IFormValues {
  skill: 'grammar' | 'vocabulary' | string;
  taskType: string;
  wordList: string;
  learnerLevel: string;
  learnerAge: string;
}

function ExerciseForm() {
  const token = LSHandler.getJwt();
  const [formValues, setFormValues] = useState<IFormValues>({
    skill: '',
    taskType: '',
    wordList: '',
    learnerLevel: LEARNER_LEVEL.B1,
    learnerAge: LEARNER_AGE.adults,
  });
  const [isFormValid, setIsFormValid] = useState<boolean>(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();

  const [generateExercise, { isLoading, error, data: createdExercise }] =
    useGenerateExerciseMutation();

  function handleSendMessage() {
    dispatch(addValues(formValues));
    generateExercise({
      token,
      body: {
        type: formValues.taskType,
        skill: formValues.skill,
        prompt: prompt,
      },
    });
  }
  const prompt = useGeneratePrompt(
    formValues.skill,
    formValues.taskType,
    formValues.wordList,
    formValues.learnerLevel,
    formValues.learnerAge
  );

  const checkFormValidity = () => {
    for (const key in formValues) {
      if (
        formValues.hasOwnProperty(key) &&
        formValues[key as keyof IFormValues] === ''
      ) {
        setIsFormValid(false);
        return;
      }
    }
    setIsFormValid(true);
  };

  useEffect(() => {
    console.log(prompt);
  }, [prompt, formValues]);

  useEffect(() => {
    if (createdExercise) {
      dispatch(addExercise(createdExercise));
      navigate(
        `${APP_PATHS.DASHBOARD_EXERCISE.replace(':id', '')}${
          createdExercise._id
        }`
      );
    }
  }, [createdExercise]);

  useEffect(() => {
    checkFormValidity();
  }, [formValues]);

  useEffect(() => {
    if (error) {
      const customError = error as customError;
      const { code, message } = customError.data;
      toast({
        title: message,
        status: 'error',
        isClosable: true,
        position: 'top-right',
      });
    }
  }, [error]);

  return (
    <Card bgColor={'background'}>
      <CardBody display="flex" gap={'8px'} flexDirection={'column'}>
        <Text fontSize={'lg'}>Choose the skill:</Text>
        <RadioGroup
          colorScheme={'secondary'}
          name="skill"
          value={formValues.skill}
          onChange={(value) => setFormValues({ ...formValues, skill: value })}
        >
          <HStack>
            <Radio value="vocabulary">Vocabulary</Radio>
            <Radio value="grammar" isDisabled>
              Grammar
            </Radio>
            <Radio value="reading" isDisabled>
              Reading
            </Radio>
          </HStack>
        </RadioGroup>
        <Text fontSize={'lg'}>Type of exercise</Text>
        <RadioGroup
          name="task-type"
          colorScheme={'secondary'}
          value={formValues.taskType}
          onChange={(value) =>
            setFormValues({ ...formValues, taskType: value })
          }
        >
          <HStack>
            <Radio value="fillInGaps">Fill-in-gaps</Radio>
            <Radio value="multipleChoice">Multiple Choice</Radio>
            <Radio value="reading" isDisabled>
              Guessing the meaning
            </Radio>
          </HStack>
        </RadioGroup>
        <VStack alignItems={'flex-start'} spacing={0}>
          <Text fontSize={'lg'}>Words to practice</Text>
          <Text fontSize={'2xs'}>type words separeted by comas</Text>
        </VStack>
        <Textarea
          colorScheme="secondary"
          onChange={(e) =>
            setFormValues({ ...formValues, wordList: e.target.value })
          }
        />
        <Text fontSize={'lg'}>Learner's level</Text>
        <Select
          defaultValue={'B1'}
          onChange={(e) =>
            setFormValues({ ...formValues, learnerLevel: e.target.value })
          }
        >
          <option value={'A1'}>Beginner A1</option>
          <option value={'A2'}>Elementary A2</option>
          <option value={'B1'}>Intermediate B1</option>
          <option value={'B2'}>Upper-Intermediate B2</option>
          <option value={'C1'}>Advanced C1</option>
        </Select>
        <Text fontSize={'lg'}>Learner's age</Text>
        <Select
          defaultValue={'adults'}
          onChange={(e) =>
            setFormValues({ ...formValues, learnerAge: e.target.value })
          }
        >
          <option value={'children'}>Children 7-12 y.o.</option>
          <option value={'teenagers'}>Teenagers 13-20 y.o.</option>
          <option value={'adults'}>Adults 20+ y.o</option>
        </Select>
      </CardBody>
      <CardFooter justifyContent={'center'}>
        {' '}
        <Tooltip
          hasArrow
          label="It might take 5-10 seconds"
          placement={'top'}
          display={isLoading ? 'block' : 'none'}
        >
          <Button
            variant={'outline'}
            colorScheme={'secondary'}
            onClick={handleSendMessage}
            isLoading={isLoading}
            loadingText={'Generating...'}
            isDisabled={!isFormValid}
          >
            Generate the exericse!
          </Button>
        </Tooltip>
      </CardFooter>
    </Card>
  );
}

export default ExerciseForm;

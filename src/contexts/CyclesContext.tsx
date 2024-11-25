import {
  createContext,
  ReactNode,
  useEffect,
  useReducer,
  useState,
} from "react";
import { Cycle, cyclesReducer } from "../reducers/cycles/redurcer";
import {
  addNewCycleAction,
  stopCurrentCycleAction,
} from "../reducers/cycles/actions";
import { differenceInSeconds } from "date-fns";

interface CreateCycleData {
  task: string;
  minutesAmount: number;
}

interface CyclesContextType {
  cycles: Cycle[];
  activeCycle: Cycle | undefined;
  activeCycleId: string | null;
  amountSeccondsPassed: number;
  maskCurrentCycleAsFinished: () => void;
  setSecoundsPassed: (v: number) => void;
  creteNewCycle: (data: CreateCycleData) => void;
  stopCurrentCycle: () => void;
}

export const CyclesContext = createContext({} as CyclesContextType);

interface CyclesContextProviderProps {
  children: ReactNode;
}

export function CyclesContextProvider({
  children,
}: CyclesContextProviderProps) {
  const [cyclesState, dispatch] = useReducer(
    cyclesReducer,
    {
      cycles: [],
      activeCycleId: null,
    },
    (initial) => {
      const storedStateJson = localStorage.getItem(
        "@task-timer:cycle-state-1.0.0"
      );

      if (storedStateJson) {
        return JSON.parse(storedStateJson);
      }

      return initial;
    }
  );

  const { cycles, activeCycleId } = cyclesState;
  const activeCycle = cycles.find((item) => item.id === activeCycleId);

  const [amountSeccondsPassed, setAmountSeccondsPassed] = useState(() => {
    if (activeCycle) {
      return differenceInSeconds(new Date(), new Date(activeCycle.startDate));
    }

    return 0;
  });

  useEffect(() => {
    const stateJson = JSON.stringify(cyclesState);

    localStorage.setItem("@task-timer:cycle-state-1.0.0", stateJson);
  }, [cyclesState]);

  function setSecoundsPassed(sec: number) {
    setAmountSeccondsPassed(sec);
  }

  function maskCurrentCycleAsFinished() {
    dispatch(maskCurrentCycleAsFinished());
  }

  function creteNewCycle(data: CreateCycleData) {
    console.log(data);

    const newCycle: Cycle = {
      id: String(new Date().getTime()),
      task: data.task,
      minutesAmount: data.minutesAmount,
      startDate: new Date(),
    };

    dispatch(addNewCycleAction(newCycle));

    setAmountSeccondsPassed(0);
  }

  function stopCurrentCycle() {
    dispatch(stopCurrentCycleAction());
  }

  return (
    <CyclesContext.Provider
      value={{
        cycles,
        activeCycle,
        activeCycleId,
        amountSeccondsPassed,
        maskCurrentCycleAsFinished,
        setSecoundsPassed,
        creteNewCycle,
        stopCurrentCycle,
      }}
    >
      {children}
    </CyclesContext.Provider>
  );
}

import { getMessage } from "../src/message";

test("adds 1 + 2 to equal 3", () => {
  expect(getMessage()).toBe("Message from @benr-ts-experiment/lib1");
});

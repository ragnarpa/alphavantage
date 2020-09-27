type Result = { data: { [key: string]: object } };

function print(result: unknown): void {
  if (result) {
    console.log(result);
  } else {
    throw new Error('Data not found.');
  }
}

export default async function (
  data: () => Promise<Result>,
  date?: string
): Promise<void> {
  const res = await data();

  if (date) {
    print(res.data[new Date(date).toISOString()]);
  } else {
    print(res);
  }
}

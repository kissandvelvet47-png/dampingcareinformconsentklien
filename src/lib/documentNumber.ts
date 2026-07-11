import { supabase } from './supabase';

export async function generateDocumentNumber(): Promise<string> {
  const currentYear = new Date().getFullYear();

  const { data, error } = await supabase
    .from('document_counter')
    .select('id, counter, year')
    .eq('id', 1)
    .maybeSingle();

  if (error) {
    return `IC-${currentYear}-0001`;
  }

  let newCounter = 1;

  if (data) {
    if (data.year !== currentYear) {
      newCounter = 1;
    } else {
      newCounter = data.counter + 1;
    }

    await supabase
      .from('document_counter')
      .update({ counter: newCounter, year: currentYear, updated_at: new Date().toISOString() })
      .eq('id', 1);
  } else {
    await supabase
      .from('document_counter')
      .insert({ id: 1, counter: 1, year: currentYear });
    newCounter = 1;
  }

  const padded = String(newCounter).padStart(4, '0');
  return `IC-${currentYear}-${padded}`;
}
